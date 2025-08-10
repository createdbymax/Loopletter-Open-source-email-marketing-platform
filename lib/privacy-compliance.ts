import { supabase } from './supabase-client';
import { 
  PrivacyConsent, 
  DataSubjectRequest, 
  DataRetentionPolicy, 
  PrivacySettings,
  DataBreachIncident,
  PrivacyComplianceStatus,
  Fan
} from './types';

// GDPR and CCPA Compliance Service

export class PrivacyComplianceService {
  
  // Consent Management
  
  static async recordConsent(
    fanId: string,
    artistId: string,
    consentData: {
      consent_type: 'email_marketing' | 'analytics' | 'data_processing';
      consent_given: boolean;
      consent_method: 'checkbox' | 'email_confirmation' | 'verbal' | 'written';
      consent_text?: string;
      privacy_policy_version: string;
      legal_basis: 'consent' | 'legitimate_interest' | 'contract' | 'legal_obligation';
      ip_address?: string;
      user_agent?: string;
    }
  ): Promise<PrivacyConsent> {
    const { data, error } = await supabase
      .from('privacy_consents')
      .insert({
        fan_id: fanId,
        artist_id: artistId,
        ...consentData,
        consent_timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Update fan's consent status
    await supabase
      .from('fans')
      .update({
        privacy_consent_given: consentData.consent_given,
        privacy_consent_date: new Date().toISOString(),
        privacy_policy_version: consentData.privacy_policy_version,
        marketing_consent: consentData.consent_type === 'email_marketing' ? consentData.consent_given : undefined,
        analytics_consent: consentData.consent_type === 'analytics' ? consentData.consent_given : undefined
      })
      .eq('id', fanId);

    return data;
  }

  static async withdrawConsent(
    fanId: string,
    consentType: string,
    withdrawalMethod: string = 'user_request'
  ): Promise<void> {
    const { error } = await supabase
      .from('privacy_consents')
      .update({
        consent_given: false,
        withdrawn_at: new Date().toISOString(),
        withdrawal_method: withdrawalMethod,
        updated_at: new Date().toISOString()
      })
      .eq('fan_id', fanId)
      .eq('consent_type', consentType)
      .eq('consent_given', true);

    if (error) throw error;
  }

  static async getConsentHistory(fanId: string): Promise<PrivacyConsent[]> {
    const { data, error } = await supabase
      .from('privacy_consents')
      .select('*')
      .eq('fan_id', fanId)
      .order('consent_timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Data Subject Rights (GDPR/CCPA)

  static async createDataSubjectRequest(
    email: string,
    artistId: string,
    requestData: {
      request_type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
      regulation: 'GDPR' | 'CCPA';
      request_details?: string;
    }
  ): Promise<DataSubjectRequest> {
    const requestId = `DSR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const verificationToken = Math.random().toString(36).substr(2, 32);

    const { data, error } = await supabase
      .from('data_subject_requests')
      .insert({
        request_id: requestId,
        email,
        artist_id: artistId,
        ...requestData,
        verification_token: verificationToken,
        verification_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      })
      .select()
      .single();

    if (error) throw error;

    // Send verification email
    await this.sendVerificationEmail(email, requestId, verificationToken);

    return data;
  }

  static async verifyDataSubjectRequest(
    requestId: string,
    verificationToken: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('data_subject_requests')
      .update({
        identity_verified: true,
        verification_method: 'email',
        updated_at: new Date().toISOString()
      })
      .eq('request_id', requestId)
      .eq('verification_token', verificationToken)
      .gt('verification_expires_at', new Date().toISOString())
      .select()
      .single();

    if (error || !data) return false;
    return true;
  }

  static async processDataSubjectRequest(
    requestId: string,
    processedBy: string
  ): Promise<any> {
    const { data: request, error: requestError } = await supabase
      .from('data_subject_requests')
      .select('*')
      .eq('request_id', requestId)
      .eq('identity_verified', true)
      .single();

    if (requestError || !request) throw new Error('Request not found or not verified');

    let responseData: any = {};

    switch (request.request_type) {
      case 'access':
        responseData = await this.generateDataExport(request.email, request.artist_id);
        break;
      case 'erasure':
        await this.deletePersonalData(request.email, request.artist_id);
        responseData = { deleted: true, deletion_date: new Date().toISOString() };
        break;
      case 'portability':
        responseData = await this.generatePortableDataExport(request.email, request.artist_id);
        break;
      case 'rectification':
        // This would require additional input from the user
        responseData = { message: 'Please provide the correct information to update' };
        break;
      case 'restriction':
        await this.restrictDataProcessing(request.email, request.artist_id);
        responseData = { restricted: true, restriction_date: new Date().toISOString() };
        break;
      case 'objection':
        await this.handleDataProcessingObjection(request.email, request.artist_id);
        responseData = { objection_processed: true, date: new Date().toISOString() };
        break;
    }

    // Update request status
    const { error: updateError } = await supabase
      .from('data_subject_requests')
      .update({
        status: 'completed',
        processed_by: processedBy,
        processed_at: new Date().toISOString(),
        response_data: responseData,
        updated_at: new Date().toISOString()
      })
      .eq('id', request.id);

    if (updateError) throw updateError;

    return responseData;
  }

  // Data Export (Right to Access)
  
  static async generateDataExport(email: string, artistId: string): Promise<any> {
    // Get fan data
    const { data: fan } = await supabase
      .from('fans')
      .select('*')
      .eq('email', email)
      .eq('artist_id', artistId)
      .single();

    if (!fan) return { message: 'No data found for this email address' };

    // Get consent history
    const consents = await this.getConsentHistory(fan.id);

    // Get email history
    const { data: emailHistory } = await supabase
      .from('emails_sent')
      .select(`
        *,
        campaigns (title, subject, sent_at)
      `)
      .eq('fan_id', fan.id);

    // Get campaign interactions
    const { data: interactions } = await supabase
      .from('emails_sent')
      .select('opened_at, clicked_at, campaign_id')
      .eq('fan_id', fan.id)
      .not('opened_at', 'is', null);

    return {
      personal_data: {
        email: fan.email,
        name: fan.name,
        tags: fan.tags,
        custom_fields: fan.custom_fields,
        status: fan.status,
        source: fan.source,
        location: fan.location,
        preferences: fan.preferences,
        created_at: fan.created_at,
        updated_at: fan.updated_at
      },
      consent_history: consents,
      email_history: emailHistory || [],
      interactions: interactions || [],
      data_retention: {
        retention_date: fan.data_retention_date,
        deletion_scheduled: fan.deletion_scheduled,
        deletion_scheduled_date: fan.deletion_scheduled_date
      }
    };
  }

  // Data Portability (GDPR Article 20)
  
  static async generatePortableDataExport(email: string, artistId: string): Promise<any> {
    const exportData = await this.generateDataExport(email, artistId);
    
    // Format data in a structured, machine-readable format
    return {
      format: 'JSON',
      version: '1.0',
      exported_at: new Date().toISOString(),
      regulation: 'GDPR Article 20',
      data: exportData
    };
  }

  // Right to be Forgotten (GDPR Article 17)
  
  static async deletePersonalData(email: string, artistId: string): Promise<void> {
    const { data: fan } = await supabase
      .from('fans')
      .select('id')
      .eq('email', email)
      .eq('artist_id', artistId)
      .single();

    if (!fan) return;

    // Anonymize instead of hard delete to preserve analytics
    await supabase
      .from('fans')
      .update({
        email: `anonymized_${fan.id}@deleted.local`,
        name: null,
        custom_fields: {},
        anonymized: true,
        anonymized_at: new Date().toISOString(),
        status: 'unsubscribed',
        updated_at: new Date().toISOString()
      })
      .eq('id', fan.id);

    // Log the deletion
    await supabase
      .from('audit_logs')
      .insert({
        fan_id: fan.id,
        artist_id: artistId,
        action: 'data_deleted',
        details: { 
          reason: 'right_to_be_forgotten',
          original_email: email,
          deletion_date: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
  }

  // Data Processing Restriction
  
  static async restrictDataProcessing(email: string, artistId: string): Promise<void> {
    const { data: fan } = await supabase
      .from('fans')
      .select('id')
      .eq('email', email)
      .eq('artist_id', artistId)
      .single();

    if (!fan) return;

    await supabase
      .from('fans')
      .update({
        status: 'restricted',
        marketing_consent: false,
        analytics_consent: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', fan.id);
  }

  // Object to Data Processing
  
  static async handleDataProcessingObjection(email: string, artistId: string): Promise<void> {
    await this.restrictDataProcessing(email, artistId);
    
    // Additional objection handling logic
    const { data: fan } = await supabase
      .from('fans')
      .select('id')
      .eq('email', email)
      .eq('artist_id', artistId)
      .single();

    if (fan) {
      await supabase
        .from('audit_logs')
        .insert({
          fan_id: fan.id,
          artist_id: artistId,
          action: 'processing_objection',
          details: { 
            objection_date: new Date().toISOString(),
            email: email
          },
          timestamp: new Date().toISOString()
        });
    }
  }

  // Privacy Settings Management
  
  static async getPrivacySettings(artistId: string): Promise<PrivacySettings | null> {
    try {
      const { data, error } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('artist_id', artistId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.warn('Privacy settings table not available:', error);
      return null;
    }
  }

  static async updatePrivacySettings(
    artistId: string,
    settings: Partial<PrivacySettings>
  ): Promise<PrivacySettings> {
    try {
      const { data, error } = await supabase
        .from('privacy_settings')
        .upsert({
          artist_id: artistId,
          ...settings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'artist_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw error;
    }
  }

  // Data Retention Management
  
  static async getRetentionPolicies(artistId: string): Promise<DataRetentionPolicy[]> {
    try {
      const { data, error } = await supabase
        .from('data_retention_policies')
        .select('*')
        .eq('artist_id', artistId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Data retention policies table not available:', error);
      return [];
    }
  }

  static async updateRetentionPolicy(
    artistId: string,
    dataType: string,
    policy: Partial<DataRetentionPolicy>
  ): Promise<DataRetentionPolicy> {
    try {
      const { data, error } = await supabase
        .from('data_retention_policies')
        .upsert({
          artist_id: artistId,
          data_type: dataType,
          ...policy,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'artist_id,data_type'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating retention policy:', error);
      throw error;
    }
  }

  // Compliance Status Assessment
  
  static async assessComplianceStatus(artistId: string): Promise<PrivacyComplianceStatus> {
    try {
      const privacySettings = await this.getPrivacySettings(artistId);
      const retentionPolicies = await this.getRetentionPolicies(artistId);
      
      const issues: string[] = [];
      const recommendations: string[] = [];
      let score = 0;

      // Check privacy settings
      if (!privacySettings) {
        issues.push('Privacy settings not configured');
        recommendations.push('Configure privacy settings in dashboard');
      } else {
        score += 20;
        
        if (!privacySettings.privacy_policy_url) {
          issues.push('Privacy policy URL not set');
          recommendations.push('Add privacy policy URL to settings');
        } else {
          score += 15;
        }

        if (!privacySettings.dpo_contact_email) {
          issues.push('Data Protection Officer contact not set');
          recommendations.push('Designate a DPO contact email');
        } else {
          score += 10;
        }
      }

      // Check retention policies
      const requiredPolicies = ['fan_data', 'campaign_data', 'analytics_data'] as const;
      const existingPolicies = retentionPolicies.map(p => p.data_type);
      const missingPolicies = requiredPolicies.filter(p => !existingPolicies.includes(p as typeof existingPolicies[0]));

      if (missingPolicies.length > 0) {
        issues.push(`Missing retention policies for: ${missingPolicies.join(', ')}`);
        recommendations.push('Configure data retention policies for all data types');
      } else {
        score += 25;
      }

      // Check consent management
      const { data: consentsExist } = await supabase
        .from('privacy_consents')
        .select('id')
        .eq('artist_id', artistId)
        .limit(1);

      if (!consentsExist || consentsExist.length === 0) {
        issues.push('No consent records found');
        recommendations.push('Implement consent collection for new subscribers');
      } else {
        score += 20;
      }

      // Check for recent data subject requests
      const { data: recentRequests } = await supabase
        .from('data_subject_requests')
        .select('id, status')
        .eq('artist_id', artistId)
        .eq('status', 'pending')
        .limit(1);

      if (recentRequests && recentRequests.length > 0) {
        issues.push('Pending data subject requests');
        recommendations.push('Process pending data subject requests within 30 days');
      } else {
        score += 10;
      }

      return {
        gdpr_compliant: score >= 80 && issues.length === 0,
        ccpa_compliant: score >= 70 && issues.length <= 1,
        consent_management_enabled: !!(consentsExist && consentsExist.length > 0),
        data_retention_configured: missingPolicies.length === 0,
        privacy_policy_current: !!privacySettings?.privacy_policy_url,
        breach_procedures_documented: false, // Would need additional check
        dpo_appointed: !!privacySettings?.dpo_contact_email,
        compliance_score: score,
        issues,
        recommendations
      };
    } catch (error) {
      console.error('Error assessing compliance status:', error);
      
      // Return default status when tables don't exist
      return {
        gdpr_compliant: false,
        ccpa_compliant: false,
        consent_management_enabled: false,
        data_retention_configured: false,
        privacy_policy_current: false,
        breach_procedures_documented: false,
        dpo_appointed: false,
        compliance_score: 0,
        issues: ['Privacy compliance tables not set up yet'],
        recommendations: ['Run the privacy compliance database setup script']
      };
    }
  }

  // Automated Data Cleanup
  
  static async runDataCleanup(): Promise<number> {
    const { data, error } = await supabase.rpc('cleanup_expired_data');
    
    if (error) throw error;
    return data || 0;
  }

  // Breach Management
  
  static async reportDataBreach(
    artistId: string,
    breachData: {
      severity: 'low' | 'medium' | 'high' | 'critical';
      breach_type: 'unauthorized_access' | 'data_loss' | 'system_compromise';
      affected_data_types: string[];
      affected_records_count?: number;
      description: string;
    }
  ): Promise<DataBreachIncident> {
    const incidentId = `BREACH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const { data, error } = await supabase
      .from('data_breach_incidents')
      .insert({
        artist_id: artistId,
        incident_id: incidentId,
        discovery_date: new Date().toISOString(),
        notification_required: breachData.severity === 'high' || breachData.severity === 'critical',
        ...breachData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Helper Methods
  
  private static async sendVerificationEmail(
    email: string,
    requestId: string,
    verificationToken: string
  ): Promise<void> {
    // This would integrate with your email service
    // For now, we'll just log it
    console.log(`Verification email sent to ${email} for request ${requestId}`);
    console.log(`Verification link: /privacy/verify?request=${requestId}&token=${verificationToken}`);
  }
}