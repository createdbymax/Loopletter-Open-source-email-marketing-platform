// Template defaults for each template type
import defaultEmailJSON from '@/lib/default-editor-json.json';
import { getEmailTemplateContent } from './index';

export function getDefaultTemplateContent(templateId: string | undefined) {
  if (!templateId) {
    return defaultEmailJSON;
  }
  
  // Get the template content based on the template ID
  const templateContent = getEmailTemplateContent(templateId);
  
  // If we have a valid template content, return it
  if (templateContent && typeof templateContent === 'object') {
    return templateContent;
  }
  
  // Fallback to default email JSON
  return defaultEmailJSON;
}