"use client";

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Button,
  Hr,
  Img,
  Link,
  CodeBlock,
} from '@react-email/components';

interface EmailRendererProps {
  content: string;
  subject: string;
  from: string;
}

export function EmailRenderer({ content, subject, from }: EmailRendererProps) {
  const parseContent = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let currentIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;

      // Headings
      if (line.startsWith('### ')) {
        elements.push(
          <Heading key={currentIndex++} as="h3" style={{ fontSize: '20px', fontWeight: 'bold', margin: '24px 0 16px 0', color: '#1f2937' }}>
            {line.substring(4)}
          </Heading>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <Heading key={currentIndex++} as="h2" style={{ fontSize: '24px', fontWeight: 'bold', margin: '32px 0 16px 0', color: '#1f2937' }}>
            {line.substring(3)}
          </Heading>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <Heading key={currentIndex++} as="h1" style={{ fontSize: '32px', fontWeight: 'bold', margin: '32px 0 20px 0', color: '#1f2937' }}>
            {line.substring(2)}
          </Heading>
        );
      }
      // Bullet lists
      else if (line.startsWith('• ')) {
        const listItems = [line.substring(2)];
        // Collect consecutive bullet points
        while (i + 1 < lines.length && lines[i + 1].trim().startsWith('• ')) {
          i++;
          listItems.push(lines[i].trim().substring(2));
        }
        elements.push(
          <Section key={currentIndex++} style={{ margin: '16px 0' }}>
            {listItems.map((item, idx) => (
              <Text key={idx} style={{ margin: '4px 0', paddingLeft: '16px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0', color: '#6b7280' }}>•</span>
                {item}
              </Text>
            ))}
          </Section>
        );
      }
      // Numbered lists
      else if (/^\d+\.\s/.test(line)) {
        const listItems = [line];
        // Collect consecutive numbered items
        while (i + 1 < lines.length && /^\d+\.\s/.test(lines[i + 1].trim())) {
          i++;
          listItems.push(lines[i].trim());
        }
        elements.push(
          <Section key={currentIndex++} style={{ margin: '16px 0' }}>
            {listItems.map((item, idx) => (
              <Text key={idx} style={{ margin: '4px 0', paddingLeft: '16px' }}>
                {item}
              </Text>
            ))}
          </Section>
        );
      }
      // Buttons
      else if (line.startsWith('[BUTTON:') && line.includes('|')) {
        const match = line.match(/\[BUTTON:\s*([^|]+)\s*\|\s*([^\]]+)\]/);
        if (match) {
          const [, buttonText, url] = match;
          elements.push(
            <Section key={currentIndex++} style={{ textAlign: 'center', margin: '24px 0' }}>
              <Button
                href={url.trim()}
                style={{
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}
              >
                {buttonText.trim()}
              </Button>
            </Section>
          );
        }
      }
      // Images
      else if (line.startsWith('[Image:')) {
        const altText = line.match(/\[Image:\s*([^\]]+)\]/)?.[1] || 'Image';
        elements.push(
          <Section key={currentIndex++} style={{ textAlign: 'center', margin: '24px 0' }}>
            <div style={{ 
              backgroundColor: '#f3f4f6', 
              padding: '40px', 
              borderRadius: '8px',
              border: '2px dashed #d1d5db'
            }}>
              <Text style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>
                📷 {altText}
              </Text>
            </div>
          </Section>
        );
      }
      // YouTube
      else if (line.startsWith('[YOUTUBE:')) {
        const url = line.match(/\[YOUTUBE:\s*([^\]]+)\]/)?.[1] || '';
        elements.push(
          <Section key={currentIndex++} style={{ textAlign: 'center', margin: '24px 0' }}>
            <div style={{ 
              backgroundColor: '#fee2e2', 
              padding: '40px', 
              borderRadius: '8px',
              border: '2px solid #fecaca'
            }}>
              <Text style={{ color: '#dc2626', fontSize: '14px', margin: '0 0 8px 0', fontWeight: 'bold' }}>
                🎥 YouTube Video
              </Text>
              <Text style={{ color: '#7f1d1d', fontSize: '12px', margin: '0' }}>
                {url}
              </Text>
            </div>
          </Section>
        );
      }
      // Twitter
      else if (line.startsWith('[TWITTER:')) {
        const url = line.match(/\[TWITTER:\s*([^\]]+)\]/)?.[1] || '';
        elements.push(
          <Section key={currentIndex++} style={{ textAlign: 'center', margin: '24px 0' }}>
            <div style={{ 
              backgroundColor: '#dbeafe', 
              padding: '40px', 
              borderRadius: '8px',
              border: '2px solid #93c5fd'
            }}>
              <Text style={{ color: '#1d4ed8', fontSize: '14px', margin: '0 0 8px 0', fontWeight: 'bold' }}>
                🐦 X (Twitter) Post
              </Text>
              <Text style={{ color: '#1e3a8a', fontSize: '12px', margin: '0' }}>
                {url}
              </Text>
            </div>
          </Section>
        );
      }
      // Quotes
      else if (line.startsWith('> ')) {
        const quoteLines = [line.substring(2)];
        // Collect consecutive quote lines
        while (i + 1 < lines.length && lines[i + 1].trim().startsWith('> ')) {
          i++;
          quoteLines.push(lines[i].trim().substring(2));
        }
        elements.push(
          <Section key={currentIndex++} style={{ 
            margin: '24px 0',
            borderLeft: '4px solid #e5e7eb',
            paddingLeft: '16px',
            backgroundColor: '#f9fafb',
            padding: '16px'
          }}>
            {quoteLines.map((quoteLine, idx) => (
              <Text key={idx} style={{ 
                margin: '4px 0', 
                fontStyle: 'italic',
                color: '#4b5563',
                fontSize: '16px'
              }}>
                {quoteLine}
              </Text>
            ))}
          </Section>
        );
      }
      // Dividers
      else if (line === '---') {
        elements.push(
          <Hr key={currentIndex++} style={{ margin: '32px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
        );
      }
      // Section breaks
      else if (line.startsWith('=== ') && line.endsWith(' ===')) {
        const sectionTitle = line.slice(4, -4);
        elements.push(
          <Section key={currentIndex++} style={{ textAlign: 'center', margin: '40px 0' }}>
            <Hr style={{ margin: '0 0 16px 0', border: 'none', borderTop: '2px solid #e5e7eb' }} />
            <Text style={{ 
              fontSize: '12px', 
              fontWeight: 'bold', 
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: '0'
            }}>
              {sectionTitle}
            </Text>
            <Hr style={{ margin: '16px 0 0 0', border: 'none', borderTop: '2px solid #e5e7eb' }} />
          </Section>
        );
      }
      // Code blocks
      else if (line.startsWith('```')) {
        const codeLines = [];
        i++; // Skip opening ```
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        elements.push(
          <Section key={currentIndex++} style={{ margin: '16px 0' }}>
            <CodeBlock
              code={codeLines.join('\n')}
              language="text"
              style={{
                backgroundColor: '#f3f4f6',
                padding: '16px',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '14px',
              }}
            />
          </Section>
        );
      }
      // Social Links
      else if (line === '[SOCIAL LINKS]') {
        const socialLines = [];
        i++; // Skip the header
        while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith('[')) {
          socialLines.push(lines[i].trim());
          i++;
        }
        i--; // Back up one since the loop will increment
        
        elements.push(
          <Section key={currentIndex++} style={{ textAlign: 'center', margin: '32px 0' }}>
            <Text style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
              Follow Us
            </Text>
            {socialLines.map((social, idx) => (
              <Text key={idx} style={{ margin: '4px 0', fontSize: '14px' }}>
                {social}
              </Text>
            ))}
          </Section>
        );
      }
      // Variables (replace with sample data)
      else if (line.includes('{{') && line.includes('}}')) {
        const processedLine = line
          .replace(/\{\{FIRST_NAME\}\}/g, 'John')
          .replace(/\{\{LAST_NAME\}\}/g, 'Doe')
          .replace(/\{\{EMAIL\}\}/g, 'john@example.com')
          .replace(/\{\{[^}]+\}\}/g, '[Variable]');
        
        elements.push(
          <Text key={currentIndex++} style={{ 
            margin: '16px 0', 
            lineHeight: '1.6',
            color: '#374151',
            fontSize: '16px'
          }}>
            {processedLine}
          </Text>
        );
      }
      // Regular text
      else {
        elements.push(
          <Text key={currentIndex++} style={{ 
            margin: '16px 0', 
            lineHeight: '1.6',
            color: '#374151',
            fontSize: '16px'
          }}>
            {line}
          </Text>
        );
      }
    }

    return elements;
  };

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <Section style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px' }}>
            {parseContent(content)}
            
            {/* Unsubscribe footer */}
            <Hr style={{ margin: '40px 0 20px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
            <Text style={{ 
              fontSize: '12px', 
              color: '#6b7280', 
              textAlign: 'center',
              margin: '0'
            }}>
              You received this email because you subscribed to our newsletter.
              <br />
              <Link href="#" style={{ color: '#6b7280', textDecoration: 'underline' }}>
                Unsubscribe
              </Link> | <Link href="#" style={{ color: '#6b7280', textDecoration: 'underline' }}>
                Update preferences
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// For browser preview (non-email context)
export function EmailPreview({ content, subject, from }: EmailRendererProps) {
  const parseContent = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let currentIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) continue;

      // Headings
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={currentIndex++} className="text-xl font-bold mt-6 mb-4 text-gray-900">
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={currentIndex++} className="text-2xl font-bold mt-8 mb-4 text-gray-900">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={currentIndex++} className="text-3xl font-bold mt-8 mb-5 text-gray-900">
            {line.substring(2)}
          </h1>
        );
      }
      // Bullet lists
      else if (line.startsWith('• ')) {
        const listItems = [line.substring(2)];
        while (i + 1 < lines.length && lines[i + 1].trim().startsWith('• ')) {
          i++;
          listItems.push(lines[i].trim().substring(2));
        }
        elements.push(
          <ul key={currentIndex++} className="list-disc list-inside my-4 space-y-1">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-gray-700">{item}</li>
            ))}
          </ul>
        );
      }
      // Numbered lists
      else if (/^\d+\.\s/.test(line)) {
        const listItems = [line];
        while (i + 1 < lines.length && /^\d+\.\s/.test(lines[i + 1].trim())) {
          i++;
          listItems.push(lines[i].trim());
        }
        elements.push(
          <ol key={currentIndex++} className="list-decimal list-inside my-4 space-y-1">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-gray-700">{item}</li>
            ))}
          </ol>
        );
      }
      // Buttons
      else if (line.startsWith('[BUTTON:') && line.includes('|')) {
        const match = line.match(/\[BUTTON:\s*([^|]+)\s*\|\s*([^\]]+)\]/);
        if (match) {
          const [, buttonText, url] = match;
          elements.push(
            <div key={currentIndex++} className="text-center my-6">
              <a
                href={url.trim()}
                className="inline-block bg-black text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors"
              >
                {buttonText.trim()}
              </a>
            </div>
          );
        }
      }
      // Images
      else if (line.startsWith('[Image:')) {
        const altText = line.match(/\[Image:\s*([^\]]+)\]/)?.[1] || 'Image';
        elements.push(
          <div key={currentIndex++} className="text-center my-6">
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-10">
              <div className="text-gray-500 text-sm">
                📷 {altText}
              </div>
            </div>
          </div>
        );
      }
      // YouTube
      else if (line.startsWith('[YOUTUBE:')) {
        const url = line.match(/\[YOUTUBE:\s*([^\]]+)\]/)?.[1] || '';
        elements.push(
          <div key={currentIndex++} className="text-center my-6">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-10">
              <div className="text-red-600 font-semibold text-sm mb-2">
                🎥 YouTube Video
              </div>
              <div className="text-red-800 text-xs">
                {url}
              </div>
            </div>
          </div>
        );
      }
      // Twitter
      else if (line.startsWith('[TWITTER:')) {
        const url = line.match(/\[TWITTER:\s*([^\]]+)\]/)?.[1] || '';
        elements.push(
          <div key={currentIndex++} className="text-center my-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-10">
              <div className="text-blue-600 font-semibold text-sm mb-2">
                🐦 X (Twitter) Post
              </div>
              <div className="text-blue-800 text-xs">
                {url}
              </div>
            </div>
          </div>
        );
      }
      // Quotes
      else if (line.startsWith('> ')) {
        const quoteLines = [line.substring(2)];
        while (i + 1 < lines.length && lines[i + 1].trim().startsWith('> ')) {
          i++;
          quoteLines.push(lines[i].trim().substring(2));
        }
        elements.push(
          <blockquote key={currentIndex++} className="border-l-4 border-gray-300 pl-4 py-4 my-6 bg-gray-50 italic text-gray-600">
            {quoteLines.map((quoteLine, idx) => (
              <p key={idx} className="mb-2 last:mb-0">
                {quoteLine}
              </p>
            ))}
          </blockquote>
        );
      }
      // Dividers
      else if (line === '---') {
        elements.push(
          <hr key={currentIndex++} className="my-8 border-gray-300" />
        );
      }
      // Section breaks
      else if (line.startsWith('=== ') && line.endsWith(' ===')) {
        const sectionTitle = line.slice(4, -4);
        elements.push(
          <div key={currentIndex++} className="text-center my-10">
            <hr className="mb-4 border-gray-300" />
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {sectionTitle}
            </div>
            <hr className="mt-4 border-gray-300" />
          </div>
        );
      }
      // Code blocks
      else if (line.startsWith('```')) {
        const codeLines = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        elements.push(
          <pre key={currentIndex++} className="bg-gray-100 p-4 rounded-md my-4 overflow-x-auto">
            <code className="text-sm font-mono">
              {codeLines.join('\n')}
            </code>
          </pre>
        );
      }
      // Social Links
      else if (line === '[SOCIAL LINKS]') {
        const socialLines = [];
        i++;
        while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith('[')) {
          socialLines.push(lines[i].trim());
          i++;
        }
        i--;
        
        elements.push(
          <div key={currentIndex++} className="text-center my-8">
            <h4 className="font-semibold mb-4">Follow Us</h4>
            {socialLines.map((social, idx) => (
              <p key={idx} className="text-sm text-gray-600 mb-1">
                {social}
              </p>
            ))}
          </div>
        );
      }
      // Variables
      else if (line.includes('{{') && line.includes('}}')) {
        const processedLine = line
          .replace(/\{\{FIRST_NAME\}\}/g, 'John')
          .replace(/\{\{LAST_NAME\}\}/g, 'Doe')
          .replace(/\{\{EMAIL\}\}/g, 'john@example.com')
          .replace(/\{\{[^}]+\}\}/g, '[Variable]');
        
        elements.push(
          <p key={currentIndex++} className="my-4 leading-relaxed text-gray-700">
            {processedLine}
          </p>
        );
      }
      // Regular text
      else {
        elements.push(
          <p key={currentIndex++} className="my-4 leading-relaxed text-gray-700">
            {line}
          </p>
        );
      }
    }

    return elements;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border rounded-lg bg-white shadow-sm">
        {/* Email header */}
        <div className="border-b p-6 bg-gray-50">
          <div className="text-sm text-gray-600 mb-1">From: {from}</div>
          <div className="text-xl font-semibold text-gray-900">
            {subject || 'Subject Line'}
          </div>
        </div>
        
        {/* Email content */}
        <div className="p-6">
          {parseContent(content)}
          
          {/* Unsubscribe footer */}
          <hr className="my-8 border-gray-200" />
          <div className="text-xs text-gray-500 text-center">
            You received this email because you subscribed to our newsletter.
            <br />
            <a href="#" className="text-gray-500 underline hover:text-gray-700">
              Unsubscribe
            </a> | <a href="#" className="text-gray-500 underline hover:text-gray-700">
              Update preferences
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}