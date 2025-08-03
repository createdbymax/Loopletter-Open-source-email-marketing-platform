import { SubscriptionPlan } from './subscription';

/**
 * Enhanced email HTML generator that preserves more styling from the editor
 */
export function generateEnhancedEmailHtml({
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
  // Process the content to convert common CSS classes to inline styles
  const processedContent = processMailyContent(content);

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
    /* Reset styles for email clients */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    
    /* Base styles */
    body {
      margin: 0 !important;
      padding: 0 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
      color: #333333 !important;
      line-height: 1.6 !important;
      background-color: #f8f9fa !important;
    }
    
    .email-container {
      max-width: 600px !important;
      margin: 0 auto !important;
      background-color: #ffffff !important;
    }
    
    .email-content {
      padding: 40px 30px !important;
    }
    
    /* Typography */
    h1, h2, h3, h4, h5, h6 {
      color: #1a1a1a !important;
      font-weight: 600 !important;
      line-height: 1.3 !important;
      margin: 0 0 16px 0 !important;
    }
    
    h1 { font-size: 28px !important; }
    h2 { font-size: 24px !important; }
    h3 { font-size: 20px !important; }
    h4 { font-size: 18px !important; }
    
    p {
      margin: 0 0 16px 0 !important;
      line-height: 1.6 !important;
      color: #333333 !important;
    }
    
    /* Images */
    img {
      max-width: 100% !important;
      height: auto !important;
      display: block !important;
    }
    
    /* Links */
    a {
      color: #2563eb !important;
      text-decoration: none !important;
    }
    
    a:hover {
      text-decoration: underline !important;
    }
    
    /* Lists */
    ul, ol {
      margin: 0 0 16px 0 !important;
      padding-left: 20px !important;
    }
    
    li {
      margin-bottom: 8px !important;
      line-height: 1.6 !important;
    }
    
    /* Text alignment */
    .text-left { text-align: left !important; }
    .text-center { text-align: center !important; }
    .text-right { text-align: right !important; }
    
    /* Horizontal rule */
    hr {
      border: 0 !important;
      border-top: 1px solid #e5e7eb !important;
      margin: 24px 0 !important;
    }
    
    /* Blockquotes */
    blockquote {
      border-left: 4px solid #e5e7eb !important;
      padding-left: 16px !important;
      margin: 0 0 16px 0 !important;
      color: #6b7280 !important;
      font-style: italic !important;
    }
    
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
      }
      
      .email-content {
        padding: 20px 15px !important;
      }
      
      h1 { font-size: 24px !important; }
      h2 { font-size: 20px !important; }
      h3 { font-size: 18px !important; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-content">
      ${processedContent}
      ${footerHtml}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Process Maily content to convert CSS classes to inline styles and preserve formatting
 */
function processMailyContent(content: string): string {
  let processedContent = content;

  // Convert common CSS classes to inline styles (both regular and mly- prefixed)
  const classToStyleMap: Record<string, string> = {
    // Text alignment
    'text-left': 'text-align: left;',
    'mly-text-left': 'text-align: left;',
    'text-center': 'text-align: center;',
    'mly-text-center': 'text-align: center;',
    'text-right': 'text-align: right;',
    'mly-text-right': 'text-align: right;',
    
    // Font weights
    'font-bold': 'font-weight: bold;',
    'mly-font-bold': 'font-weight: bold;',
    'font-semibold': 'font-weight: 600;',
    'mly-font-semibold': 'font-weight: 600;',
    'font-medium': 'font-weight: 500;',
    'mly-font-medium': 'font-weight: 500;',
    'font-normal': 'font-weight: normal;',
    'mly-font-normal': 'font-weight: normal;',
    
    // Font sizes
    'text-xs': 'font-size: 12px;',
    'mly-text-xs': 'font-size: 12px;',
    'text-sm': 'font-size: 14px;',
    'mly-text-sm': 'font-size: 14px;',
    'text-base': 'font-size: 16px;',
    'mly-text-base': 'font-size: 16px;',
    'text-lg': 'font-size: 18px;',
    'mly-text-lg': 'font-size: 18px;',
    'text-xl': 'font-size: 20px;',
    'mly-text-xl': 'font-size: 20px;',
    'text-2xl': 'font-size: 24px;',
    'mly-text-2xl': 'font-size: 24px;',
    'text-3xl': 'font-size: 30px;',
    'mly-text-3xl': 'font-size: 30px;',
    
    // Colors
    'text-gray-500': 'color: #6b7280;',
    'mly-text-gray-500': 'color: #6b7280;',
    'text-gray-600': 'color: #4b5563;',
    'mly-text-gray-600': 'color: #4b5563;',
    'text-gray-700': 'color: #374151;',
    'mly-text-gray-700': 'color: #374151;',
    'text-gray-800': 'color: #1f2937;',
    'mly-text-gray-800': 'color: #1f2937;',
    'text-gray-900': 'color: #111827;',
    'mly-text-gray-900': 'color: #111827;',
    'text-black': 'color: #000000;',
    'mly-text-black': 'color: #000000;',
    'text-white': 'color: #ffffff;',
    'mly-text-white': 'color: #ffffff;',
    
    // Margins and padding
    'mb-1': 'margin-bottom: 4px;',
    'mly-mb-1': 'margin-bottom: 4px;',
    'mb-2': 'margin-bottom: 8px;',
    'mly-mb-2': 'margin-bottom: 8px;',
    'mb-4': 'margin-bottom: 16px;',
    'mly-mb-4': 'margin-bottom: 16px;',
    'mb-6': 'margin-bottom: 24px;',
    'mly-mb-6': 'margin-bottom: 24px;',
    'mt-1': 'margin-top: 4px;',
    'mly-mt-1': 'margin-top: 4px;',
    'mt-2': 'margin-top: 8px;',
    'mly-mt-2': 'margin-top: 8px;',
    'mt-4': 'margin-top: 16px;',
    'mly-mt-4': 'margin-top: 16px;',
    'mt-6': 'margin-top: 24px;',
    'mly-mt-6': 'margin-top: 24px;',
    
    // Padding
    'p-2': 'padding: 8px;',
    'mly-p-2': 'padding: 8px;',
    'p-4': 'padding: 16px;',
    'mly-p-4': 'padding: 16px;',
    'px-2': 'padding-left: 8px; padding-right: 8px;',
    'mly-px-2': 'padding-left: 8px; padding-right: 8px;',
    'px-4': 'padding-left: 16px; padding-right: 16px;',
    'mly-px-4': 'padding-left: 16px; padding-right: 16px;',
    'py-2': 'padding-top: 8px; padding-bottom: 8px;',
    'mly-py-2': 'padding-top: 8px; padding-bottom: 8px;',
    'py-4': 'padding-top: 16px; padding-bottom: 16px;',
    'mly-py-4': 'padding-top: 16px; padding-bottom: 16px;',
    
    // Border radius for images and elements
    'rounded': 'border-radius: 6px;',
    'mly-rounded': 'border-radius: 6px;',
    'rounded-sm': 'border-radius: 2px;',
    'mly-rounded-sm': 'border-radius: 2px;',
    'rounded-md': 'border-radius: 6px;',
    'mly-rounded-md': 'border-radius: 6px;',
    'rounded-lg': 'border-radius: 8px;',
    'mly-rounded-lg': 'border-radius: 8px;',
    'rounded-xl': 'border-radius: 12px;',
    'mly-rounded-xl': 'border-radius: 12px;',
    'rounded-2xl': 'border-radius: 16px;',
    'mly-rounded-2xl': 'border-radius: 16px;',
    'rounded-3xl': 'border-radius: 24px;',
    'mly-rounded-3xl': 'border-radius: 24px;',
    'rounded-full': 'border-radius: 50%;',
    'mly-rounded-full': 'border-radius: 50%;',
    
    // Background colors
    'bg-gray-50': 'background-color: #f9fafb;',
    'mly-bg-gray-50': 'background-color: #f9fafb;',
    'bg-gray-100': 'background-color: #f3f4f6;',
    'mly-bg-gray-100': 'background-color: #f3f4f6;',
    'bg-white': 'background-color: #ffffff;',
    'mly-bg-white': 'background-color: #ffffff;',
    'bg-black': 'background-color: #000000;',
    'mly-bg-black': 'background-color: #000000;',
    
    // Borders
    'border': 'border: 1px solid #e5e7eb;',
    'mly-border': 'border: 1px solid #e5e7eb;',
    'border-gray-200': 'border-color: #e5e7eb;',
    'mly-border-gray-200': 'border-color: #e5e7eb;',
    'border-gray-300': 'border-color: #d1d5db;',
    'mly-border-gray-300': 'border-color: #d1d5db;',
  };

  // Process each class-to-style mapping
  Object.entries(classToStyleMap).forEach(([className, inlineStyle]) => {
    // Replace class attributes with inline styles
    const classRegex = new RegExp(`class="([^"]*\\b${className}\\b[^"]*)"`, 'g');
    processedContent = processedContent.replace(classRegex, (match) => {
      // Check if the element already has a style attribute
      const elementMatch = processedContent.substring(
        processedContent.lastIndexOf('<', processedContent.indexOf(match)),
        processedContent.indexOf('>', processedContent.indexOf(match)) + 1
      );
      
      if (elementMatch.includes('style=')) {
        // Add to existing style attribute
        return match.replace(/style="([^"]*)"/, `style="$1 ${inlineStyle}"`);
      } else {
        // Add new style attribute
        return `${match} style="${inlineStyle}"`;
      }
    });
  });

  // Ensure images have proper email-friendly attributes and preserve styling
  processedContent = processedContent.replace(
    /<img([^>]*?)>/g,
    (match, attributes) => {
      let newAttributes = attributes;
      
      // Extract existing style attribute
      const styleMatch = newAttributes.match(/style="([^"]*?)"/);
      const existingStyles = styleMatch ? styleMatch[1] : '';
      
      // Base email-friendly styles
      let emailStyles = 'max-width: 100%; height: auto; display: block;';
      
      // Preserve border-radius if it exists in the existing styles
      if (existingStyles.includes('border-radius')) {
        emailStyles += ` ${existingStyles}`;
      } else {
        // Check for rounded classes in the class attribute and convert them
        const classMatch = newAttributes.match(/class="([^"]*?)"/);
        if (classMatch) {
          const classes = classMatch[1];
          if (classes.includes('rounded-full') || classes.includes('mly-rounded-full')) {
            emailStyles += ' border-radius: 50%;';
          } else if (classes.includes('rounded-3xl') || classes.includes('mly-rounded-3xl')) {
            emailStyles += ' border-radius: 24px;';
          } else if (classes.includes('rounded-2xl') || classes.includes('mly-rounded-2xl')) {
            emailStyles += ' border-radius: 16px;';
          } else if (classes.includes('rounded-xl') || classes.includes('mly-rounded-xl')) {
            emailStyles += ' border-radius: 12px;';
          } else if (classes.includes('rounded-lg') || classes.includes('mly-rounded-lg')) {
            emailStyles += ' border-radius: 8px;';
          } else if (classes.includes('rounded-md') || classes.includes('mly-rounded-md') || classes.includes('rounded')) {
            emailStyles += ' border-radius: 6px;';
          } else if (classes.includes('rounded-sm') || classes.includes('mly-rounded-sm')) {
            emailStyles += ' border-radius: 2px;';
          }
        }
        
        // Add any other existing styles
        if (existingStyles) {
          emailStyles += ` ${existingStyles}`;
        }
      }
      
      // Update or add style attribute
      if (styleMatch) {
        newAttributes = newAttributes.replace(/style="([^"]*?)"/, `style="${emailStyles}"`);
      } else {
        newAttributes += ` style="${emailStyles}"`;
      }
      
      // Add alt attribute if missing
      if (!newAttributes.includes('alt=')) {
        newAttributes += ' alt=""';
      }
      
      return `<img${newAttributes}>`;
    }
  );

  // Process inline styles to replace CSS variables with actual values
  processedContent = processCSSVariables(processedContent);
  
  // Convert any remaining div elements to more email-friendly table structure for complex layouts
  // This is a simplified approach - for complex layouts, you might need more sophisticated processing
  
  return processedContent;
}

/**
 * Process CSS variables and replace them with actual values for email compatibility
 */
function processCSSVariables(content: string): string {
  // Common Maily CSS variables and their default values
  const cssVariables: Record<string, string> = {
    '--mly-body-background-color': '#ffffff',
    '--mly-container-background-color': '#ffffff',
    '--mly-container-max-width': '600px',
    '--mly-container-padding-left': '20px',
    '--mly-container-padding-right': '20px',
    '--mly-container-padding-top': '20px',
    '--mly-container-padding-bottom': '20px',
    '--mly-container-border-radius': '0px',
    '--mly-container-border-width': '0px',
    '--mly-container-border-color': 'transparent',
    '--mly-font': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  };

  let processedContent = content;

  // Replace CSS variables in style attributes
  Object.entries(cssVariables).forEach(([variable, value]) => {
    const regex = new RegExp(`var\\(${variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g');
    processedContent = processedContent.replace(regex, value);
  });

  return processedContent;
}