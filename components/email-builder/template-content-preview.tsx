'use client';

import { useState, useEffect, useCallback } from 'react';
import { getEmailTemplateContent } from '@/lib/email-templates';
import { convertTemplateToMailyFormat } from '@/lib/email-templates/template-converter';
import { TemplatePreviewSkeleton } from './template-preview-skeleton';

interface TemplateContentPreviewProps {
  templateId: string;
  height?: number;
}

export function TemplateContentPreview({ templateId, height = 300 }: TemplateContentPreviewProps) {
  const [html, setHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to extract text from content nodes
  const extractTextFromContent = (content: any[]): string => {
    if (!Array.isArray(content)) return '';
    
    return content.map(node => {
      if (node.type === 'text') {
        return node.text;
      } else if (node.content) {
        return extractTextFromContent(node.content);
      }
      return '';
    }).join('');
  };

  // Function to simplify the template content for preview
  const simplifyTemplateContent = (content: any): string => {
    if (!content || !content.content || !Array.isArray(content.content)) {
      return '';
    }
    
    // Process only the first few elements to keep the preview simple
    const previewElements = content.content.slice(0, 5);
    
    let html = '';
    
    previewElements.forEach(node => {
      if (node.type === 'heading' && node.content) {
        const level = node.attrs?.level || 2;
        const text = extractTextFromContent(node.content);
        html += `<h${level}>${text}</h${level}>`;
      } else if (node.type === 'paragraph' && node.content) {
        const text = extractTextFromContent(node.content);
        html += `<p>${text}</p>`;
      } else if (node.type === 'image' && node.attrs) {
        html += `<img src="${node.attrs.src}" alt="${node.attrs.alt || ''}" style="max-width: 100%; height: auto;" />`;
      } else if (node.type === 'horizontalRule') {
        html += '<hr />';
      } else if (node.type === 'spacer') {
        html += '<div class="spacer"></div>';
      }
    });
    
    return html;
  };

  // Function to generate a simplified HTML preview from the template content
  const generatePreviewHtml = useCallback((templateContent: any): string => {
    // For blank template, show a simple message
    if (templateId === 'blank') {
      return `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; background-color: #f9fafb; color: #6b7280; font-family: Arial, sans-serif;">
          <div style="text-align: center;">
            <p style="margin: 0;">Start with a blank canvas</p>
            <p style="margin: 0; font-size: 0.875rem;">Design your email from scratch</p>
          </div>
        </div>
      `;
    }
    
    // For other templates, generate a simplified preview
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.5;
            font-size: 10px;
          }
          .container {
            max-width: 100%;
            padding: 10px;
            background-color: #ffffff;
          }
          img { 
            max-width: 100%; 
            height: auto; 
            display: block;
            margin: 0 auto;
          }
          h1, h2, h3, h4, h5, h6 {
            margin-top: 10px;
            margin-bottom: 5px;
            font-weight: bold;
          }
          h1 { font-size: 16px; }
          h2 { font-size: 14px; }
          h3 { font-size: 12px; }
          p {
            margin-bottom: 8px;
            line-height: 1.3;
          }
          a {
            color: #2563eb;
            text-decoration: none;
          }
          hr {
            border: 0;
            border-top: 1px solid #eaeaea;
            margin: 10px 0;
          }
          .spacer {
            height: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${simplifyTemplateContent(templateContent)}
        </div>
      </body>
      </html>
    `;
  }, [templateId]);

  useEffect(() => {
    setIsLoading(true);
    
    try {
      // Get the template content
      const templateContent = getEmailTemplateContent(templateId);
      
      if (templateContent) {
        // Convert the template content to a format that can be displayed
        const convertedTemplate = convertTemplateToMailyFormat(templateContent);
        
        // Generate a simplified HTML preview
        const previewHtml = generatePreviewHtml(convertedTemplate);
        setHtml(previewHtml);
      } else {
        setHtml('<div class="text-center p-4">Preview not available</div>');
      }
    } catch (error) {
      console.error('Error generating template preview:', error);
      setHtml('<div class="text-center p-4">Error loading preview</div>');
    } finally {
      setIsLoading(false);
    }
  }, [templateId, generatePreviewHtml]);

  return (
    <div 
      className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white"
      style={{ height: `${height}px` }}
    >
      {isLoading ? (
        <TemplatePreviewSkeleton />
      ) : (
        <iframe
          srcDoc={html}
          title={`Preview of ${templateId} template`}
          className="w-full h-full"
          sandbox="allow-same-origin"
        />
      )}
    </div>
  );
}