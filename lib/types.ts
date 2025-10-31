export type Artist = {
    id: string;
    name: string;
    bio: string | null;
    email: string;
    slug: string;
    ses_domain_verified: boolean;
    ses_domain?: string | null;
    ses_status?: string | null;
    ses_verification_token?: string | null;
    domain_claim_timestamp?: string | null;
    domain_verified_timestamp?: string | null;
    default_from_name?: string | null;
    default_from_email?: string | null;
    clerk_user_id: string;
    created_at: string;
    updated_at: string;
    sending_suspended?: boolean;
    suspension_reason?: string;
    compliance_flags?: string[];
    last_reputation_check?: string;
    settings?: ArtistSettings;
    subscription_plan?: 'starter' | 'independent' | 'label';
    subscription_status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
    subscription_current_period_end?: string | null;
    subscription_cancel_at_period_end?: boolean;
    stripe_customer_id?: string | null;
    stripe_subscription_id?: string | null;
    subscription_metadata?: Record<string, string | number | boolean>;
    subscription?: {
        plan: 'starter' | 'independent' | 'label';
        status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
        current_period_end?: string;
        cancel_at_period_end?: boolean;
        stripe_customer_id?: string;
        stripe_subscription_id?: string;
        metadata?: Record<string, string | number | boolean>;
    };
};
export type ArtistSettings = {
    timezone: string;
    send_time_optimization: boolean;
    double_opt_in: boolean;
    unsubscribe_redirect_url?: string;
    onboarding_completed?: boolean;
    logo_url?: string;
    brand_colors: {
        primary: string;
        secondary: string;
    };
    social_links: {
        website?: string;
        instagram?: string;
        twitter?: string;
        spotify?: string;
    };
    subscription_page_settings?: {
        theme: string;
        colors: {
            primary: string;
            secondary: string;
            accent: string;
        };
        layout: string;
        header: {
            title: string;
            subtitle: string;
            show_social_links: boolean;
            show_artist_image: boolean;
            artist_image_url: string | null;
        };
        form: {
            button_text: string;
            button_style: string;
            show_name_field: boolean;
            placeholder_email: string;
            placeholder_name: string;
        };
        benefits: {
            show_benefits: boolean;
            custom_benefits: string[];
        };
        success_message: {
            title: string;
            message: string;
        };
    };
};
export type Fan = {
    id: string;
    email: string;
    artist_id: string;
    name?: string | null;
    tags?: string[] | null;
    custom_fields?: Record<string, string | number | boolean>;
    status: 'subscribed' | 'unsubscribed' | 'bounced' | 'pending' | 'rejected';
    source: string;
    location?: {
        country?: string;
        city?: string;
        timezone?: string;
    };
    preferences?: {
        frequency: 'daily' | 'weekly' | 'monthly';
        content_types: string[];
    };
    tracking_preferences?: {
        allow_open_tracking: boolean;
        allow_click_tracking: boolean;
    };
    review_status?: 'pending' | 'approved' | 'rejected';
    quarantine_reason?: string;
    quarantined_at?: string;
    reviewed_at?: string;
    reviewed_by?: string;
    review_notes?: string;
    risk_score?: number;
    created_at: string;
    updated_at: string;
    confirmed_at?: string;
    unsubscribed_at?: string;
};
export type Campaign = {
    id: string;
    title: string;
    subject: string;
    message: string;
    preview_text?: string | null;
    from_name?: string | null;
    from_email?: string | null;
    artwork_url?: string | null;
    link?: string | null;
    send_date: string;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
    artist_id: string;
    template_id?: string | null;
    template_data?: Record<string, unknown> | null;
    segment_id?: string | null;
    ab_test_id?: string | null;
    job_id?: string | null;
    settings: CampaignSettings;
    stats: CampaignStats;
    created_at: string;
    updated_at: string;
};
export type CampaignSettings = {
    send_time_optimization: boolean;
    track_opens: boolean;
    track_clicks: boolean;
    auto_tweet: boolean;
    send_to_unsubscribed: boolean;
};
export type CampaignStats = {
    total_sent: number;
    delivered: number;
    opens: number;
    unique_opens: number;
    clicks: number;
    unique_clicks: number;
    bounces: number;
    complaints: number;
    unsubscribes: number;
    open_rate: number;
    click_rate: number;
    bounce_rate: number;
    unsubscribe_rate: number;
};
export type EmailSent = {
    id: string;
    fan_id: string;
    campaign_id: string;
    email_address: string;
    status: 'sent' | 'delivered' | 'bounced' | 'complained';
    opened_at?: string;
    clicked_at?: string;
    bounced_at?: string;
    complained_at?: string;
    sent_at: string;
    message_id?: string;
    error_message?: string;
};
export type Segment = {
    id: string;
    name: string;
    description?: string;
    artist_id: string;
    conditions: SegmentCondition[];
    fan_count: number;
    created_at: string;
    updated_at: string;
};
export type SegmentCondition = {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: string | number | boolean | string[];
    logic?: 'and' | 'or';
};
export type Automation = {
    id: string;
    name: string;
    description?: string;
    artist_id: string;
    trigger: AutomationTrigger;
    actions: AutomationAction[];
    status: 'active' | 'paused' | 'draft';
    stats: {
        triggered: number;
        completed: number;
        conversion_rate: number;
    };
    created_at: string;
    updated_at: string;
};
export type AutomationTrigger = {
    type: 'fan_subscribed' | 'fan_tagged' | 'campaign_opened' | 'campaign_clicked' | 'date_based' | 'custom_field_changed';
    conditions: Record<string, string | number | boolean>;
    delay?: {
        amount: number;
        unit: 'minutes' | 'hours' | 'days' | 'weeks';
    };
};
export type AutomationAction = {
    type: 'send_email' | 'add_tag' | 'remove_tag' | 'update_field' | 'webhook' | 'wait';
    config: Record<string, string | number | boolean>;
    delay?: {
        amount: number;
        unit: 'minutes' | 'hours' | 'days' | 'weeks';
    };
};
export type ABTest = {
    id: string;
    name: string;
    campaign_id: string;
    artist_id: string;
    test_type: 'subject' | 'content' | 'send_time' | 'from_name';
    variants: ABTestVariant[];
    traffic_split: number[];
    winner_criteria: 'open_rate' | 'click_rate' | 'conversion_rate';
    status: 'draft' | 'running' | 'completed' | 'cancelled';
    winner_variant_id?: string;
    started_at?: string;
    completed_at?: string;
    created_at: string;
};
export type ABTestVariant = {
    id: string;
    name: string;
    content: Record<string, string | number | boolean>;
    stats: CampaignStats;
};
export type Template = {
    id: string;
    name: string;
    description?: string;
    category: 'music_release' | 'show_announcement' | 'merchandise' | 'newsletter' | 'welcome' | 'custom';
    thumbnail_url?: string;
    html_content: string;
    variables: TemplateVariable[];
    is_public: boolean;
    artist_id?: string;
    created_at: string;
    updated_at: string;
};
export type TemplateVariable = {
    name: string;
    type: 'text' | 'image' | 'url' | 'color' | 'number' | 'boolean';
    label: string;
    default_value?: string | number | boolean;
    required: boolean;
};
export type Webhook = {
    id: string;
    artist_id: string;
    name: string;
    url: string;
    events: string[];
    secret?: string;
    status: 'active' | 'paused';
    last_triggered_at?: string;
    created_at: string;
};
export type TeamMember = {
    id: string;
    artist_id: string;
    email: string;
    name: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    permissions: string[];
    invited_at: string;
    joined_at?: string;
    status: 'pending' | 'active' | 'suspended';
};
export type Integration = {
    id: string;
    artist_id: string;
    type: 'shopify' | 'woocommerce' | 'stripe' | 'spotify' | 'instagram' | 'twitter' | 'zapier';
    name: string;
    config: Record<string, string | number | boolean>;
    status: 'connected' | 'disconnected' | 'error';
    last_sync_at?: string;
    created_at: string;
};
export type TemplateData = {
    templateId: string;
    data: Record<string, unknown>;
};
export type AnalyticsData = {
    period: 'day' | 'week' | 'month' | 'year';
    metrics: {
        campaigns_sent: number;
        emails_delivered: number;
        total_opens: number;
        total_clicks: number;
        new_subscribers: number;
        unsubscribes: number;
        revenue?: number;
    };
    trends: {
        date: string;
        value: number;
    }[];
};
export type CampaignFormData = {
    title: string;
    subject: string;
    message: string;
    from_name?: string;
    from_email?: string;
    template_id?: string;
    template_data?: Record<string, unknown>;
    segment_id?: string;
    send_date?: string;
    settings: CampaignSettings;
};
export type FanFormData = {
    email: string;
    name?: string;
    tags?: string[];
    custom_fields?: Record<string, unknown>;
    source?: string;
};
export type SegmentFormData = {
    name: string;
    description?: string;
    conditions: SegmentCondition[];
};
export type FanReview = {
    id: string;
    fan_id: string;
    artist_id: string;
    review_type: 'spam_detection' | 'manual_flag' | 'bulk_import';
    risk_score: number;
    flags: string[];
    recommendations: string[];
    original_data: Record<string, any>;
    status: 'pending' | 'approved' | 'rejected';
    reviewed_by?: string;
    reviewed_at?: string;
    review_notes?: string;
    auto_flagged_at: string;
    created_at: string;
};
export type ReviewStats = {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
};
export type PrivacyConsent = {
    id: string;
    fan_id: string;
    artist_id: string;
    consent_type: 'email_marketing' | 'analytics' | 'data_processing';
    consent_given: boolean;
    consent_method: 'checkbox' | 'email_confirmation' | 'verbal' | 'written';
    consent_text?: string;
    privacy_policy_version: string;
    legal_basis: 'consent' | 'legitimate_interest' | 'contract' | 'legal_obligation';
    ip_address?: string;
    user_agent?: string;
    consent_timestamp: string;
    withdrawn_at?: string;
    withdrawal_method?: string;
    created_at: string;
    updated_at: string;
};
export type DataSubjectRequest = {
    id: string;
    request_id: string;
    fan_id?: string;
    artist_id: string;
    email: string;
    request_type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
    regulation: 'GDPR' | 'CCPA';
    status: 'pending' | 'in_progress' | 'completed' | 'rejected';
    request_details?: string;
    identity_verified: boolean;
    verification_method?: string;
    verification_token?: string;
    verification_expires_at?: string;
    processed_by?: string;
    processed_at?: string;
    response_data?: Record<string, any>;
    rejection_reason?: string;
    created_at: string;
    updated_at: string;
};
export type DataRetentionPolicy = {
    id: string;
    artist_id: string;
    data_type: 'fan_data' | 'campaign_data' | 'analytics_data';
    retention_period_days: number;
    deletion_method: 'hard_delete' | 'anonymize' | 'archive';
    auto_delete_enabled: boolean;
    last_cleanup_at?: string;
    created_at: string;
    updated_at: string;
};
export type PrivacySettings = {
    id: string;
    artist_id: string;
    cookie_consent_required: boolean;
    analytics_opt_out_available: boolean;
    data_processing_transparency: boolean;
    automatic_deletion_enabled: boolean;
    privacy_policy_url?: string;
    privacy_policy_version: string;
    dpo_contact_email?: string;
    gdpr_representative_contact?: string;
    ccpa_contact_info?: string;
    created_at: string;
    updated_at: string;
};
export type DataBreachIncident = {
    id: string;
    artist_id?: string;
    incident_id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    breach_type: 'unauthorized_access' | 'data_loss' | 'system_compromise';
    affected_data_types: string[];
    affected_records_count?: number;
    discovery_date: string;
    containment_date?: string;
    notification_required: boolean;
    authorities_notified: boolean;
    subjects_notified: boolean;
    notification_date?: string;
    description: string;
    impact_assessment?: string;
    remediation_actions?: string;
    status: 'open' | 'investigating' | 'contained' | 'resolved';
    created_at: string;
    updated_at: string;
};
export type DataProcessingActivity = {
    id: string;
    artist_id: string;
    activity_name: string;
    purpose: string;
    legal_basis: string;
    data_categories: string[];
    data_subjects: string[];
    recipients?: string[];
    retention_period?: string;
    security_measures?: string;
    created_at: string;
    updated_at: string;
};
export type PrivacyComplianceStatus = {
    gdpr_compliant: boolean;
    ccpa_compliant: boolean;
    consent_management_enabled: boolean;
    data_retention_configured: boolean;
    privacy_policy_current: boolean;
    breach_procedures_documented: boolean;
    dpo_appointed: boolean;
    last_audit_date?: string;
    compliance_score: number;
    issues: string[];
    recommendations: string[];
};
export type ImportJob = {
    id: string;
    artist_id: string;
    type: 'fan_import';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    total_records: number;
    processed_records: number;
    successful_imports: number;
    failed_imports: number;
    skip_duplicates: boolean;
    file_data: {
        filename: string;
        column_mapping: {
            email: string;
            name: string;
            [key: string]: string;
        };
        tags: string[];
        source: string;
    };
    result?: {
        imported: number;
        failed: number;
        skipped: number;
        errors: Array<{
            email: string;
            error: string;
        }>;
    };
    error_message?: string;
    created_at: string;
    updated_at: string;
    completed_at?: string;
};
export type Notification = {
    id: string;
    artist_id: string;
    type: 'import_completed' | 'import_failed' | 'campaign_sent' | 'system_alert';
    title: string;
    message: string;
    data?: Record<string, any>;
    read: boolean;
    created_at: string;
    expires_at?: string;
};
