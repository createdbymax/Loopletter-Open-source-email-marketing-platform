import defaultEmailJSON from '@/lib/default-editor-json.json';
import { getEmailTemplateContent } from './index';
export function getDefaultTemplateContent(templateId: string | undefined) {
    if (!templateId) {
        return defaultEmailJSON;
    }
    const templateContent = getEmailTemplateContent(templateId);
    if (templateContent && typeof templateContent === 'object') {
        return templateContent;
    }
    return defaultEmailJSON;
}
