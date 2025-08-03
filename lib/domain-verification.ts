// Domain verification utilities for AWS SES integration
import { GetIdentityVerificationAttributesCommand, SESClient } from '@aws-sdk/client-ses';

const ses = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Check if a domain is verified in AWS SES
 */
export async function checkDomainVerification(domain: string): Promise<{
  verified: boolean;
  status: string;
  error?: string;
}> {
  try {
    const command = new GetIdentityVerificationAttributesCommand({
      Identities: [domain],
    });

    const result = await ses.send(command);
    const attributes = result.VerificationAttributes?.[domain];

    if (!attributes) {
      return {
        verified: false,
        status: 'not_found',
        error: 'Domain not found in AWS SES'
      };
    }

    return {
      verified: attributes.VerificationStatus === 'Success',
      status: attributes.VerificationStatus || 'unknown'
    };
  } catch (error) {
    console.error('Error checking domain verification:', error);
    return {
      verified: false,
      status: 'error',
      error: 'Failed to check verification status'
    };
  }
}

/**
 * Verify domain ownership by checking DNS records
 */
export async function verifyDomainOwnership(domain: string): Promise<boolean> {
  try {
    // In a real implementation, this would:
    // 1. Check for the AWS SES verification TXT record
    // 2. Verify DKIM records
    // 3. Validate SPF records
    
    const verification = await checkDomainVerification(domain);
    return verification.verified;
  } catch (error) {
    console.error('Error verifying domain ownership:', error);
    return false;
  }
}