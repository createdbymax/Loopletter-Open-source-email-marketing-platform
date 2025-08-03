import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateArtistByClerkId } from "@/lib/db";
import {  ses } from '@/lib/ses-config';
import { SendEmailCommand } from '@aws-sdk/client-ses';

// Helper function to convert Tiptap JSON to HTML
function convertTiptapJsonToHtml(json: any): string {
  if (!json || !json.content) return '';
  
  return json.content.map((node: any) => {
    switch (node.type) {
      case 'paragraph':
        const pContent = node.content?.map((child: any) => {
          if (child.type === 'text') {
            let text = child.text || '';
            if (child.marks) {
              child.marks.forEach((mark: any) => {
                switch (mark.type) {
                  case 'bold':
                    text = `<strong>${text}</strong>`;
                    break;
                  case 'italic':
                    text = `<em>${text}</em>`;
                    break;
                  case 'link':
                    text = `<a href="${mark.attrs?.href || '#'}">${text}</a>`;
                    break;
                }
              });
            }
            return text;
          }
          return '';
        }).join('') || '';
        return `<p>${pContent}</p>`;
      
      case 'heading':
        const level = node.attrs?.level || 1;
        const hContent = node.content?.map((child: any) => child.text || '').join('') || '';
        return `<h${level}>${hContent}</h${level}>`;
      
      case 'bulletList':
        const listItems = node.content?.map((item: any) => {
          const itemContent = item.content?.map((p: any) => 
            p.content?.map((child: any) => child.text || '').join('') || ''
          ).join('') || '';
          return `<li>${itemContent}</li>`;
        }).join('') || '';
        return `<ul>${listItems}</ul>`;
      
      default:
        return '';
    }
  }).join('');
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subject, previewText, content, to, from } = body;

    // Validate required fields
    if (!subject || !content || !to) {
      return NextResponse.json({ 
        error: "Subject, content, and recipient email are required" 
      }, { status: 400 });
    }

    // Get the artist associated with the current user
    const artist = await getOrCreateArtistByClerkId(userId, "", "");

    // Verify the artist has a verified domain (skip in development)
    if (process.env.NODE_ENV === 'production' && (!artist.ses_domain || !artist.ses_domain_verified)) {
      return NextResponse.json({
        error: "You must have a verified domain to send test emails",
        details: "Please set up and verify your domain in the Domain Settings"
      }, { status: 400 });
    }

    // Parse the from field - it might already contain email format
    const fromName = artist.default_from_name || artist.name;
    let senderEmail = "";
    
    if (from && from.includes('<') && from.includes('>')) {
      // From field already contains email format like "Name <email@domain.com>"
      senderEmail = from;
    } else {
      // Construct email from components
      const displayName = from || fromName;
      const emailPrefix = artist.default_from_email || "noreply";
      
      senderEmail = artist.ses_domain_verified && artist.ses_domain
        ? `${displayName} <${emailPrefix}@${artist.ses_domain}>`
        : `${displayName} via Loopletter <noreply@loopletter.co>`;
    }
    
    console.log("🔍 Domain check:", {
      ses_domain: artist.ses_domain,
      ses_domain_verified: artist.ses_domain_verified,
      default_from_email: artist.default_from_email,
      from: from,
      hasVerifiedDomain: artist.ses_domain_verified && artist.ses_domain
    });
      
    console.log("🔍 Using sender email:", senderEmail);

    // Parse content - it might be JSON from the editor
    let htmlContent = content;
    try {
      const parsedContent = JSON.parse(content);
      // If it's JSON from the editor, we need to convert it to HTML
      // This is a basic conversion - in a real app you'd use a proper JSON to HTML converter
      if (parsedContent.type === 'doc' && parsedContent.content) {
        htmlContent = convertTiptapJsonToHtml(parsedContent);
      } else {
        htmlContent = content;
      }
    } catch {
      // If it's not JSON, use as-is (it's already HTML)
      htmlContent = content;
    }

    // Create the email parameters
    const params = {
      Source: senderEmail,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: `[TEST] ${subject}`,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: `
              <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>${subject}</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background-color: #f0f0f0; padding: 10px; margin-bottom: 20px; border-radius: 5px; text-align: center;">
                    <strong>🧪 TEST EMAIL</strong> - This is a test email from your campaign
                  </div>
                  ${htmlContent}
                  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                    <p>This is a test email sent from Loopletter.</p>
                  </div>
                </body>
              </html>
            `,
            Charset: 'UTF-8',
          },
          Text: {
            Data: `[TEST] ${subject}\n\n${previewText || ''}\n\nThis is a test email from your campaign.\n\n---\nThis is a test email sent from Loopletter.`,
            Charset: 'UTF-8',
          },
        },
      },
    };

    // Send the email
    const command = new SendEmailCommand(params);
    const result = await ses.send(command);

    return NextResponse.json({
      success: true,
      messageId: result.MessageId,
      message: `Test email sent to ${to}`
    });

  } catch (error: unknown) {
    console.error("Failed to send test email:", error);
    return NextResponse.json(
      { 
        error: "Failed to send test email", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}