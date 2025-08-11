import { NextResponse } from 'next/server';


export async function GET() {
  try {
    // Create test data
    const testCampaign = {
      id: 'test-campaign-id',
      title: 'Test Campaign',
      subject: 'Test Email Subject',
      message: '<p class="mly-relative">This is a test email from the designer with some content.</p>',
      settings: {
        track_opens: true,
        track_clicks: true
      },
      from_name: 'Test Artist',
      from_email: 'test@example.com'
    };

    const testFan = {
      id: 'test-fan-id',
      email: 'test@example.com',
      name: 'Test Fan',
      status: 'subscribed'
    };

    const testArtist = {
      id: 'test-artist-id',
      name: 'Test Artist',
      default_from_name: 'Test Artist',
      default_from_email: 'hello',
      ses_domain: null,
      ses_domain_verified: false
    };

    console.log('=== TESTING EMAIL FORMAT ===');
    console.log('Original message:', testCampaign.message);
    console.log('Message includes <p>:', testCampaign.message.includes('<p>'));
    
    // Test the email formatting without actually sending
    // We'll simulate the addEmailTracking function logic
    let processedMessage = testCampaign.message;
    const baseUrl = 'http://localhost:3000';
    const unsubscribeUrl = `${baseUrl}/unsubscribe?fan_id=${testFan.id}&campaign_id=${testCampaign.id}`;
    const preferencesUrl = `${baseUrl}/preferences?fan_id=${testFan.id}`;

    // Check if this is HTML content
    console.log('Message content:', JSON.stringify(processedMessage));
    console.log('Message length:', processedMessage.length);
    console.log('First 50 chars:', processedMessage.substring(0, 50));
    
    const hasHtml = processedMessage.includes('<html>');
    const hasDoctype = processedMessage.includes('<!DOCTYPE');
    const hasP = processedMessage.includes('<p>');
    const hasPAlt = processedMessage.indexOf('<p>') !== -1;
    const hasPRegex = /<p/.test(processedMessage);
    const hasDiv = processedMessage.includes('<div>');
    const hasBr = processedMessage.includes('<br>');
    const hasSpan = processedMessage.includes('<span>');
    
    console.log('HTML checks:', { hasHtml, hasDoctype, hasP, hasDiv, hasBr, hasSpan });
    
    const isHtml = hasHtml || hasDoctype || hasPRegex || hasDiv || hasBr || hasSpan;

    console.log('Is HTML detected:', isHtml);

    if (isHtml) {
      // Add open tracking pixel
      if (testCampaign.settings?.track_opens) {
        const trackingPixel = `<img src="${baseUrl}/api/track/open?mid=test-message-id&cid=${testCampaign.id}&fid=${testFan.id}" width="1" height="1" style="display:none;" alt="" />`;
        
        if (processedMessage.includes('</body>')) {
          processedMessage = processedMessage.replace(/<\/body>/i, `${trackingPixel}\n</body>`);
        }
      }

      // Wrap content in complete HTML structure if it's not already
      if (!processedMessage.includes('<html>') && !processedMessage.includes('<!DOCTYPE')) {
        processedMessage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${testCampaign.subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto;">
    ${processedMessage}
  </div>
</body>
</html>`;
      }

      // Add unsubscribe footer if not already present
      if (!processedMessage.includes('unsubscribe')) {
        const unsubscribeFooter = `
        <div style="font-size: 12px; color: #666; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="margin: 0 0 10px 0;">You're receiving this email because you subscribed to updates from ${testArtist.name}.</p>
          <p style="margin: 0;">
            <a href="${unsubscribeUrl}" style="color: #666; text-decoration: none;">Unsubscribe</a> | 
            <a href="${preferencesUrl}" style="color: #666; text-decoration: none;">Update preferences</a>
          </p>
        </div>
      `;

        // Add Loopletter footer
        const loopletterFooter = `
        <div style="font-size: 12px; color: #666; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eaeaea;">
          <p style="margin: 0;">
            Sent with <a href="https://loopletter.co" style="color: #666; text-decoration: none;">Loopletter</a>
          </p>
        </div>
      `;

        // Insert both footers before closing container div and body
        processedMessage = processedMessage.replace(
          /<\/div>\s*<\/body>/,
          unsubscribeFooter + loopletterFooter + '\n  </div>\n</body>'
        );
      }
    }

    console.log('Final processed message length:', processedMessage.length);
    console.log('Contains unsubscribe:', processedMessage.includes('unsubscribe'));
    console.log('Contains Loopletter:', processedMessage.includes('Loopletter'));

    return NextResponse.json({
      success: true,
      original: testCampaign.message,
      processed: processedMessage,
      isHtml: isHtml,
      hasUnsubscribe: processedMessage.includes('unsubscribe'),
      hasLoopletter: processedMessage.includes('Loopletter'),
      debug: {
        messageLength: processedMessage.length,
        first50Chars: processedMessage.substring(0, 50),
        hasHtml: processedMessage.includes('<html>'),
        hasDoctype: processedMessage.includes('<!DOCTYPE'),
        hasP: hasP,
        hasPAlt: hasPAlt,
        hasPRegex: hasPRegex,
        hasDiv: processedMessage.includes('<div>'),
        hasBr: processedMessage.includes('<br>'),
        hasSpan: processedMessage.includes('<span>')
      }
    });

  } catch (error) {
    console.error('Test email format error:', error);
    return NextResponse.json({
      error: 'Failed to test email format',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}