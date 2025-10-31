export function convertTemplateToMailyFormat(template: any): any {
    if (!template || typeof template !== 'object') {
        return template;
    }
    const convertedTemplate = JSON.parse(JSON.stringify(template));
    if (convertedTemplate.content && Array.isArray(convertedTemplate.content)) {
        convertedTemplate.content = convertedTemplate.content.map((node: any) => {
            if (node.type === 'divider') {
                return {
                    type: 'horizontalRule'
                };
            }
            if (node.content && Array.isArray(node.content)) {
                node.content = node.content.map((childNode: any) => convertTemplateToMailyFormat(childNode));
            }
            return node;
        });
    }
    return convertedTemplate;
}
