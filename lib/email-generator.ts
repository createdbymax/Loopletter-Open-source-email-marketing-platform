import { SubscriptionPlan } from './subscription';
import { generateEnhancedEmailHtml } from './enhanced-email-generator';

/**
 * Generates the complete HTML email with optional footer based on subscription plan
 * @deprecated Use generateEnhancedEmailHtml for better styling preservation
 */
export function generateEmailHtml({
  title,
  previewText,
  content,
  subscriptionPlan = 'starter'
}: {
  title: string;
  previewText?: string;
  content: string;
  subscriptionPlan?: SubscriptionPlan;
}): string {
  // Use the enhanced generator by default
  return generateEnhancedEmailHtml({ title, previewText, content, subscriptionPlan });
}

/**
 * Legacy basic email generator - kept for compatibility
 */
export function generateBasicEmailHtml({
  title,
  previewText,
  content,
  subscriptionPlan = 'starter'
}: {
  title: string;
  previewText?: string;
  content: string;
  subscriptionPlan?: SubscriptionPlan;
}): string {
  const footerHtml = subscriptionPlan === 'starter' 
    ? `
    <div style="font-size: 12px; color: #666; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eaeaea;">
      Created and sent with <a href="https://loopletter.co" style="color: #2563eb; text-decoration: none;">Loopletter</a>
    </div>
    `
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  ${previewText ? `<meta name="description" content="${previewText}">` : ''}
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      color: #333;
      line-height: 1.5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
    }
    img { 
      max-width: 100%; 
      height: auto; 
      display: block;
      margin: 0 auto;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #333;
      margin-top: 20px;
      margin-bottom: 10px;
      font-weight: bold;
    }
    h1 { font-size: 24px; }
    h2 { font-size: 20px; }
    h3 { font-size: 18px; }
    p {
      margin-bottom: 15px;
      line-height: 1.5;
    }
    a {
      color: #2563eb;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    ul, ol {
      margin-bottom: 15px;
      padding-left: 20px;
    }
    li {
      margin-bottom: 5px;
    }
    .text-center {
      text-align: center;
    }
    .text-right {
      text-align: right;
    }
    hr {
      border: 0;
      border-top: 1px solid #eaeaea;
      margin: 20px 0;
    }
    blockquote {
      border-left: 4px solid #eaeaea;
      padding-left: 15px;
      margin-left: 0;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
    ${footerHtml}
  </div>
</body>
</html>`;
}

// Re-export the enhanced generator
export { generateEnhancedEmailHtml } from './enhanced-email-generator';