"use client";
import { useCallback } from 'react';
import { analytics } from '@/lib/analytics';
export function useAnalytics() {
    const track = useCallback((event: string, properties?: Record<string, any>) => {
        analytics.track(event, properties);
    }, []);
    const identify = useCallback((userId: string, properties?: Record<string, any>) => {
        analytics.identify(userId, properties);
    }, []);
    const page = useCallback((name?: string, properties?: Record<string, any>) => {
        analytics.page(name, properties);
    }, []);
    const reset = useCallback(() => {
        analytics.reset();
    }, []);
    const trackCampaignCreated = useCallback((campaignId: string, campaignType: string) => {
        track('Campaign Created', {
            campaign_id: campaignId,
            campaign_type: campaignType,
        });
    }, [track]);
    const trackCampaignSent = useCallback((campaignId: string, recipientCount: number) => {
        track('Campaign Sent', {
            campaign_id: campaignId,
            recipient_count: recipientCount,
        });
    }, [track]);
    const trackFanImported = useCallback((importMethod: string, fanCount: number) => {
        track('Fans Imported', {
            import_method: importMethod,
            fan_count: fanCount,
        });
    }, [track]);
    const trackSegmentCreated = useCallback((segmentId: string, segmentSize: number) => {
        track('Segment Created', {
            segment_id: segmentId,
            segment_size: segmentSize,
        });
    }, [track]);
    const trackSubscriptionUpgrade = useCallback((fromPlan: string, toPlan: string) => {
        track('Subscription Upgraded', {
            from_plan: fromPlan,
            to_plan: toPlan,
        });
    }, [track]);
    const trackEmailOpened = useCallback((campaignId: string, fanId: string) => {
        track('Email Opened', {
            campaign_id: campaignId,
            fan_id: fanId,
        });
    }, [track]);
    const trackEmailClicked = useCallback((campaignId: string, fanId: string, linkUrl: string) => {
        track('Email Clicked', {
            campaign_id: campaignId,
            fan_id: fanId,
            link_url: linkUrl,
        });
    }, [track]);
    const trackDomainVerified = useCallback((domain: string) => {
        track('Domain Verified', {
            domain: domain,
        });
    }, [track]);
    const trackTeamMemberInvited = useCallback((role: string) => {
        track('Team Member Invited', {
            role: role,
        });
    }, [track]);
    return {
        track,
        identify,
        page,
        reset,
        trackCampaignCreated,
        trackCampaignSent,
        trackFanImported,
        trackSegmentCreated,
        trackSubscriptionUpgrade,
        trackEmailOpened,
        trackEmailClicked,
        trackDomainVerified,
        trackTeamMemberInvited,
        isEnabled: analytics.isEnabled,
    };
}
