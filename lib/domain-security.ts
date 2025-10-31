import { supabase } from './supabase';
import { Artist } from './types';
export async function validateDomainOwnership(artistId: string, domain: string): Promise<boolean> {
    try {
        const { data: artist, error } = await supabase
            .from('artists')
            .select('ses_domain, ses_domain_verified')
            .eq('id', artistId)
            .single();
        if (error || !artist) {
            return false;
        }
        return artist.ses_domain === domain && artist.ses_domain_verified === true;
    }
    catch (error) {
        console.error('Error validating domain ownership:', error);
        return false;
    }
}
export async function validateFromEmail(artistId: string, fromEmail: string): Promise<{
    valid: boolean;
    reason?: string;
}> {
    try {
        const emailDomain = fromEmail.split('@')[1];
        if (!emailDomain) {
            return { valid: false, reason: 'Invalid email format' };
        }
        const { data: artist, error } = await supabase
            .from('artists')
            .select('ses_domain, ses_domain_verified')
            .eq('id', artistId)
            .single();
        if (error || !artist) {
            return { valid: false, reason: 'Artist not found' };
        }
        if (emailDomain === 'loopletter.co') {
            return { valid: true };
        }
        if (artist.ses_domain && artist.ses_domain_verified) {
            if (emailDomain === artist.ses_domain) {
                return { valid: true };
            }
        }
        return {
            valid: false,
            reason: `You can only send from your verified domain (${artist.ses_domain}) or loopletter.co`
        };
    }
    catch (error) {
        console.error('Error validating from email:', error);
        return { valid: false, reason: 'Validation error' };
    }
}
export async function isDomainAlreadyClaimed(domain: string, excludeArtistId?: string): Promise<boolean> {
    try {
        let query = supabase
            .from('artists')
            .select('id')
            .eq('ses_domain', domain);
        if (excludeArtistId) {
            query = query.neq('id', excludeArtistId);
        }
        const { data, error } = await query;
        if (error) {
            console.error('Error checking domain claim:', error);
            return true;
        }
        return data && data.length > 0;
    }
    catch (error) {
        console.error('Error checking domain claim:', error);
        return true;
    }
}
export function generateDefaultFromEmail(artist: Artist): string {
    const emailPrefix = artist.default_from_email || "noreply";
    if (artist.ses_domain_verified && artist.ses_domain) {
        return `${emailPrefix}@${artist.ses_domain}`;
    }
    return `noreply@loopletter.co`;
}
