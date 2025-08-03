// Domain security utilities
import { supabase } from './supabase';
import { Artist } from './types';

/**
 * Validates that a user owns and can use a specific domain
 */
export async function validateDomainOwnership(artistId: string, domain: string): Promise<boolean> {
  try {
    // Check if the artist has this domain verified
    const { data: artist, error } = await supabase
      .from('artists')
      .select('ses_domain, ses_domain_verified')
      .eq('id', artistId)
      .single();

    if (error || !artist) {
      return false;
    }

    // Domain must match exactly and be verified
    return artist.ses_domain === domain && artist.ses_domain_verified === true;
  } catch (error) {
    console.error('Error validating domain ownership:', error);
    return false;
  }
}

/**
 * Validates that an email address is allowed for the given artist
 */
export async function validateFromEmail(artistId: string, fromEmail: string): Promise<{
  valid: boolean;
  reason?: string;
}> {
  try {
    // Extract domain from email
    const emailDomain = fromEmail.split('@')[1];
    if (!emailDomain) {
      return { valid: false, reason: 'Invalid email format' };
    }

    // Get artist's verified domain
    const { data: artist, error } = await supabase
      .from('artists')
      .select('ses_domain, ses_domain_verified')
      .eq('id', artistId)
      .single();

    if (error || !artist) {
      return { valid: false, reason: 'Artist not found' };
    }

    // Allow Loopletter default domain
    if (emailDomain === 'loopletter.co') {
      return { valid: true };
    }

    // Check if using their own verified domain
    if (artist.ses_domain && artist.ses_domain_verified) {
      if (emailDomain === artist.ses_domain) {
        return { valid: true };
      }
    }

    return { 
      valid: false, 
      reason: `You can only send from your verified domain (${artist.ses_domain}) or loopletter.co` 
    };
  } catch (error) {
    console.error('Error validating from email:', error);
    return { valid: false, reason: 'Validation error' };
  }
}

/**
 * Checks if a domain is already claimed by another user
 */
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
      return true; // Err on the side of caution
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error checking domain claim:', error);
    return true;
  }
}

/**
 * Generates a safe default from email for an artist
 */
export function generateDefaultFromEmail(artist: Artist): string {
  const emailPrefix = artist.default_from_email || "noreply";
  
  if (artist.ses_domain_verified && artist.ses_domain) {
    return `${emailPrefix}@${artist.ses_domain}`;
  }
  
  return `noreply@loopletter.co`;
}