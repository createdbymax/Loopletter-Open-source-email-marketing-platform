"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, Globe, CheckCircle, AlertCircle, Copy, ExternalLink, Shield, Mail } from 'lucide-react';
import { Artist } from '@/lib/types';
interface DomainStepProps {
    artist: Artist;
    onNext: () => void;
    onSkip: () => void;
    onStepComplete: () => void;
}
export function DomainStep({ artist, onNext, onSkip, onStepComplete }: DomainStepProps) {
    const [domain, setDomain] = useState(artist.ses_domain || '');
    const [loading, setLoading] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed' | null>(null);
    const [dnsRecords, setDnsRecords] = useState<any[]>([]);
    const benefits = [
        {
            icon: Shield,
            title: 'Better Deliverability',
            description: 'Emails are more likely to reach the inbox instead of spam'
        },
        {
            icon: Mail,
            title: 'Professional Appearance',
            description: 'Send emails from your own domain (you@yourdomain.com)'
        },
        {
            icon: CheckCircle,
            title: 'Build Trust',
            description: 'Fans recognize emails coming from your official domain'
        }
    ];
    const handleDomainSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!domain.trim())
            return;
        setLoading(true);
        setVerificationStatus('pending');
        try {
            const response = await fetch('/api/domain/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ domain: domain.trim() }),
            });
            const data = await response.json();
            if (response.ok) {
                setDnsRecords(data.dnsRecords || []);
                setVerificationStatus('pending');
            }
            else {
                setVerificationStatus('failed');
            }
        }
        catch (error) {
            console.error('Error verifying domain:', error);
            setVerificationStatus('failed');
        }
        finally {
            setLoading(false);
        }
    };
    const checkVerification = async () => {
        if (!domain)
            return;
        setLoading(true);
        try {
            const response = await fetch(`/api/domain/check?domain=${encodeURIComponent(domain)}`);
            const data = await response.json();
            if (data.verified) {
                setVerificationStatus('verified');
                onStepComplete();
            }
            else {
                setVerificationStatus('failed');
            }
        }
        catch (error) {
            console.error('Error checking verification:', error);
            setVerificationStatus('failed');
        }
        finally {
            setLoading(false);
        }
    };
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };
    const handleContinue = () => {
        if (verificationStatus === 'verified') {
            onStepComplete();
        }
        onNext();
    };
    return (<div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-gray-600">
          Set up your custom domain to improve email deliverability and build trust with your fans.
        </p>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {benefits.map((benefit, index) => (<div key={index} className="p-4 border rounded-lg bg-gray-50">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <benefit.icon className="w-5 h-5 text-blue-600"/>
              </div>
              <h4 className="font-medium text-gray-900">{benefit.title}</h4>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </div>
          </div>))}
      </div>

      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5"/>
            <span>Enter Your Domain</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDomainSubmit} className="space-y-4">
            <div>
              <Label htmlFor="domain">Domain Name</Label>
              <Input id="domain" type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="yourdomain.com" disabled={verificationStatus === 'verified'}/>
              <p className="text-xs text-gray-500 mt-1">
                Enter your domain without 'www' or 'http://'
              </p>
            </div>

            {verificationStatus !== 'verified' && (<Button type="submit" disabled={loading || !domain.trim()}>
                {loading ? 'Verifying...' : 'Verify Domain'}
              </Button>)}
          </form>
        </CardContent>
      </Card>

      
      {dnsRecords.length > 0 && verificationStatus === 'pending' && (<Card>
          <CardHeader>
            <CardTitle>Add DNS Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4"/>
              <AlertDescription>
                Add these DNS records to your domain's DNS settings. This is usually done through your domain registrar or hosting provider.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {dnsRecords.map((record, index) => (<div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-gray-500">TYPE</Label>
                      <p className="font-mono">{record.type}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">NAME</Label>
                      <p className="font-mono break-all">{record.name}</p>
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-gray-500">VALUE</Label>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(record.value)}>
                          <Copy className="w-3 h-3"/>
                        </Button>
                      </div>
                      <p className="font-mono text-xs break-all bg-gray-50 p-2 rounded">
                        {record.value}
                      </p>
                    </div>
                  </div>
                </div>))}
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={checkVerification} disabled={loading}>
                {loading ? 'Checking...' : 'Check Verification'}
              </Button>
              
              <Button variant="ghost" asChild>
                <a href="https://docs.loopletter.co/domain-setup" target="_blank" rel="noopener noreferrer">
                  Need Help?
                  <ExternalLink className="w-4 h-4 ml-2"/>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>)}

      
      {verificationStatus === 'verified' && (<Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600"/>
          <AlertDescription className="text-green-800">
            Great! Your domain has been verified and is ready to use for sending emails.
          </AlertDescription>
        </Alert>)}

      {verificationStatus === 'failed' && (<Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600"/>
          <AlertDescription className="text-red-800">
            Domain verification failed. Please check your DNS records and try again.
          </AlertDescription>
        </Alert>)}

      
      <div className="flex justify-between items-center pt-4">
        <Button variant="ghost" onClick={onSkip}>
          Skip for now
        </Button>
        
        <Button onClick={handleContinue}>
          Continue
          <ArrowRight className="w-4 h-4 ml-2"/>
        </Button>
      </div>

      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Don't have a domain yet?</h4>
        <p className="text-sm text-blue-800 mb-3">
          You can skip this step and set up domain verification later. You'll still be able to send emails using our default domain.
        </p>
        <Button variant="outline" size="sm" asChild>
          <a href="https://docs.loopletter.co/getting-a-domain" target="_blank" rel="noopener noreferrer">
            Learn about getting a domain
            <ExternalLink className="w-4 h-4 ml-2"/>
          </a>
        </Button>
      </div>
    </div>);
}
