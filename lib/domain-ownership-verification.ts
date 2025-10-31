import { supabase } from './supabase';
import { SESClient, VerifyDomainIdentityCommand, GetIdentityVerificationAttributesCommand } from '@aws-sdk/client-ses';
import { randomBytes } from 'crypto';
const ses = new SESClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});
export async function claimDomainWithVerification(artistId: string, domain: string): Promise<{
    success: boolean;
    verificationToken?: string;
    error?: string;
}> {
    try {
        const { data: existingClaim, error: checkError } = await supabase
            .from('artists')
            .select('id, ses_domain')
            .eq('ses_domain', domain)
            .neq('id', artistId)
            .single();
        if (checkError && checkError.code !== 'PGRST116') {
            throw new Error('Database error checking domain claim');
        }
        if (existingClaim) {
            return {
                success: false,
                error: 'This domain is already claimed by another user'
            };
        }
        const verifyCommand = new VerifyDomainIdentityCommand({
            Domain: domain
        });
        const verifyResult = await ses.send(verifyCommand);
        const verificationToken = verifyResult.VerificationToken;
        if (!verificationToken) {
            return {
                success: false,
                error: 'Failed to generate verification token from AWS SES'
            };
        }
        const { error: updateError } = await supabase
            .from('artists')
            .update({
            ses_domain: domain,
            ses_domain_verified: false,
            ses_status: 'pending_verification',
            ses_verification_token: verificationToken,
            domain_claim_timestamp: new Date().toISOString()
        })
            .eq('id', artistId);
        if (updateError) {
            throw new Error('Failed to update artist record');
        }
        return {
            success: true,
            verificationToken
        };
    }
    catch (error) {
        console.error('Error claiming domain:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}
export async function verifyDomainOwnership(artistId: string, domain: string): Promise<{
    success: boolean;
    verified: boolean;
    error?: string;
}> {
    try {
        const { data: artist, error: artistError } = await supabase
            .from('artists')
            .select('ses_domain, ses_verification_token, domain_claim_timestamp')
            .eq('id', artistId)
            .single();
        if (artistError || !artist) {
            return {
                success: false,
                verified: false,
                error: 'Artist not found'
            };
        }
        if (artist.ses_domain !== domain) {
            return {
                success: false,
                verified: false,
                error: 'Domain does not match your claimed domain'
            };
        }
        const command = new GetIdentityVerificationAttributesCommand({
            Identities: [domain]
        });
        const result = await ses.send(command);
        const attributes = result.VerificationAttributes?.[domain];
        const isVerified = attributes?.VerificationStatus === 'Success';
        const sesToken = attributes?.VerificationToken;
        if (isVerified && artist.ses_verification_token && sesToken !== artist.ses_verification_token) {
            console.warn(`Token mismatch for domain ${domain}. Expected: ${artist.ses_verification_token}, Got: ${sesToken}`);
            return {
                success: false,
                verified: false,
                error: 'Verification token mismatch - possible security issue'
            };
        }
        if (isVerified) {
            const { error: updateError } = await supabase
                .from('artists')
                .update({
                ses_domain_verified: true,
                ses_status: 'verified',
                domain_verified_timestamp: new Date().toISOString()
            })
                .eq('id', artistId);
            if (updateError) {
                console.error('Failed to update verification status:', updateError);
            }
        }
        return {
            success: true,
            verified: isVerified
        };
    }
    catch (error) {
        console.error('Error verifying domain ownership:', error);
        return {
            success: false,
            verified: false,
            error: error instanceof Error ? error.message : 'Verification failed'
        };
    }
}
export async function cleanupExpiredDomainClaims(): Promise<void> {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { error } = await supabase
            .from('artists')
            .update({
            ses_domain: null,
            ses_domain_verified: false,
            ses_status: null,
            ses_verification_token: null,
            domain_claim_timestamp: null
        })
            .lt('domain_claim_timestamp', sevenDaysAgo.toISOString())
            .eq('ses_domain_verified', false);
        if (error) {
            console.error('Error cleaning up expired domain claims:', error);
        }
    }
    catch (error) {
        console.error('Error in cleanup process:', error);
    }
}
export async function canClaimDomain(domain: string, artistId: string): Promise<{
    canClaim: boolean;
    reason?: string;
}> {
    try {
        const { data: existingClaim, error } = await supabase
            .from('artists')
            .select('id, ses_domain_verified, domain_claim_timestamp')
            .eq('ses_domain', domain)
            .neq('id', artistId)
            .single();
        if (error && error.code !== 'PGRST116') {
            return { canClaim: false, reason: 'Database error' };
        }
        if (existingClaim) {
            if (existingClaim.ses_domain_verified) {
                return {
                    canClaim: false,
                    reason: 'Domain is already verified by another user'
                };
            }
            const claimTime = new Date(existingClaim.domain_claim_timestamp);
            const now = new Date();
            const hoursSinceClaim = (now.getTime() - claimTime.getTime()) / (1000 * 60 * 60);
            if (hoursSinceClaim < 24) {
                return {
                    canClaim: false,
                    reason: 'Domain was recently claimed by another user. Please try again later.'
                };
            }
        }
        return { canClaim: true };
    }
    catch (error) {
        console.error('Error checking domain claim eligibility:', error);
        return { canClaim: false, reason: 'Error checking domain availability' };
    }
}
