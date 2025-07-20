// Convert our templates to be compatible with Maily.to

export function convertTemplateToMailyFormat(template: any): any {
  if (!template || typeof template !== 'object') {
    return template;
  }

  // Clone the template to avoid modifying the original
  const convertedTemplate = JSON.parse(JSON.stringify(template));

  // Process the content array if it exists
  if (convertedTemplate.content && Array.isArray(convertedTemplate.content)) {
    convertedTemplate.content = convertedTemplate.content.map((node: any) => {
      // Convert divider nodes to horizontal rule nodes
      if (node.type === 'divider') {
        return {
          type: 'horizontalRule'
        };
      }

      // Recursively convert nested content
      if (node.content && Array.isArray(node.content)) {
        node.content = node.content.map((childNode: any) => 
          convertTemplateToMailyFormat(childNode)
        );
      }

      return node;
    });
  }

  return convertedTemplate;
}