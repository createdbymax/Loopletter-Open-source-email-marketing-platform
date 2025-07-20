// Debug utilities for development

export function debugTemplateLoading(templateId: string | undefined, templateContent: any) {
  console.log(`Loading template: ${templateId}`);
  console.log('Template content:', templateContent);
}