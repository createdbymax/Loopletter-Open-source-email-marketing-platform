import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId } from '@/lib/db';
import { 
  analyzeCampaignContent, 
  checkSendingReputation,
  createComplianceAuditLog 
} from '@/lib/spam-prevention';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get artist
    const artist = await getOrCreateArtistByClerkId(
      user.id,
      user.primaryEmailAddress?.emailAddress || '',
      user.fullName || 'Artist'
    );

    const body = await request.json();
    const { subject, content, from_name, from_email } = body;
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (!subject || !content) {
      return NextResponse.json({ 
        error: 'Subject and content are required' 
      }, { status: 400 });
    }

    // Check sending reputation
    const reputationCheck = await checkSendingReputation(artist.id);
    
    if (!reputationCheck.canSend) {
      return NextResponse.json({
        success: false,
        can_send: false,
        reputation: reputationCheck.reputation,
        error: 'Cannot send campaign due to poor sending reputation',
        warnings: reputationCheck.warnings,
        recommendations: [
          'Clean your email list by removing bounced and inactive subscribers',
          'Focus on engaging content to improve open and click rates',
          'Consider a re-engagement campaign for inactive subscribers',
          'Contact support if you believe this is an error'
        ]
      }, { status: 403 });
    }

    // Analyze campaign content for spam indicators
    const contentAnalysis = analyzeCampaignContent(subject, content);

    // Additional checks for compliance
    const complianceChecks = [];
    const recommendations = [];

    // Check for required elements
    if (!content.toLowerCase().includes('unsubscribe')) {
      complianceChecks.push('missing_unsubscribe_link');
      recommendations.push('Include a clear unsubscribe link in your email');
    }

    // Check from address
    if (from_email && !from_email.includes(artist.ses_domain || '')) {
      complianceChecks.push('unverified_from_domain');
      recommendations.push('Use a verified sending domain for better deliverability');
    }

    // Check for physical address (CAN-SPAM requirement)
    const hasPhysicalAddress = /\d+\s+[\w\s]+,\s*[\w\s]+,\s*[A-Z]{2}\s+\d{5}/.test(content);
    if (!hasPhysicalAddress) {
      complianceChecks.push('missing_physical_address');
      recommendations.push('Include your physical mailing address (required by CAN-SPAM Act)');
    }

    // Combine all recommendations
    const allRecommendations = [
      ...contentAnalysis.recommendations,
      ...recommendations,
      ...reputationCheck.warnings
    ];

    // Calculate overall compliance score
    const complianceScore = Math.max(0, 100 - 
      (contentAnalysis.riskScore * 0.7) - 
      (complianceChecks.length * 15) -
      (reputationCheck.reputation === 'poor' ? 30 : 0)
    );

    const canSend = complianceScore >= 60 && reputationCheck.canSend;

    // Log the validation attempt
    await createComplianceAuditLog(artist.id, 'campaign_validated', {
      subject,
      content_length: content.length,
      content_risk_score: contentAnalysis.riskScore,
      compliance_score: complianceScore,
      compliance_checks: complianceChecks,
      reputation: reputationCheck.reputation,
      can_send: canSend,
      ip_address: clientIP,
      user_agent: userAgent
    });

    return NextResponse.json({
      success: true,
      can_send: canSend,
      compliance_score: Math.round(complianceScore),
      content_analysis: {
        risk_score: contentAnalysis.riskScore,
        flags: contentAnalysis.flags,
        is_valid: contentAnalysis.isValid
      },
      reputation_check: {
        reputation: reputationCheck.reputation,
        metrics: reputationCheck.metrics,
        can_send: reputationCheck.canSend
      },
      compliance_checks: complianceChecks,
      recommendations: allRecommendations,
      aws_ses_guidance: {
        message: 'AWS SES requires that you only send emails to recipients who have explicitly opted in to receive your emails.',
        requirements: [
          'Maintain records of how each email address was obtained',
          'Include a clear and easy way to unsubscribe',
          'Honor unsubscribe requests within 10 business days',
          'Include your physical mailing address',
          'Use clear and non-deceptive subject lines',
          'Monitor bounce and complaint rates closely'
        ]
      }
    });

  } catch (error) {
    console.error('Error validating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to validate campaign' },
      { status: 500 }
    );
  }
}