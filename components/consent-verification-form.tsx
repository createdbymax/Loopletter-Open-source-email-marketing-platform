'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConsentVerificationFormProps {
  onConsentVerified: (verification: ConsentVerification) => void;
  source: 'signup_form' | 'manual_entry' | 'import' | 'api';
  emailCount?: number;
}

export interface ConsentVerification {
  source: 'signup_form' | 'manual_entry' | 'import' | 'api';
  timestamp: string;
  double_opt_in: boolean;
  consent_text?: string;
  verification_method: 'email_confirmation' | 'checkbox' | 'verbal' | 'written';
}

export function ConsentVerificationForm({ 
  onConsentVerified, 
  source, 
  emailCount = 1 
}: ConsentVerificationFormProps) {
  const [verificationMethod, setVerificationMethod] = useState<string>('');
  const [doubleOptIn, setDoubleOptIn] = useState(false);
  const [consentText, setConsentText] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  const handleSubmit = () => {
    if (!verificationMethod || !acknowledged) return;

    const verification: ConsentVerification = {
      source,
      timestamp: new Date().toISOString(),
      double_opt_in: doubleOptIn,
      consent_text: consentText.trim() || undefined,
      verification_method: verificationMethod as ConsentVerification['verification_method']
    };

    onConsentVerified(verification);
  };

  const getSourceDescription = () => {
    switch (source) {
      case 'signup_form':
        return 'Subscribers who signed up through your website form';
      case 'manual_entry':
        return 'Manually entered email addresses';
      case 'import':
        return 'Imported from an external source (CSV, etc.)';
      case 'api':
        return 'Added via API integration';
      default:
        return 'Email addresses to be added';
    }
  };

  const isHighRisk = source === 'import' || source === 'api';

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Consent Verification Required
        </CardTitle>
        <CardDescription>
          {getSourceDescription()} - {emailCount} email{emailCount !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isHighRisk && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>High-risk source detected.</strong> AWS SES requires documented consent 
              for all email addresses. Failure to comply may result in account suspension.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">
              How was consent obtained from these subscribers?
            </Label>
            <RadioGroup 
              value={verificationMethod} 
              onValueChange={setVerificationMethod}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email_confirmation" id="email_confirmation" />
                <Label htmlFor="email_confirmation">
                  Email confirmation (double opt-in)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="checkbox" id="checkbox" />
                <Label htmlFor="checkbox">
                  Checkbox on signup form
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="written" id="written" />
                <Label htmlFor="written">
                  Written consent (contracts, forms)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="verbal" id="verbal" />
                <Label htmlFor="verbal">
                  Verbal consent (recorded/documented)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="double_opt_in" 
              checked={doubleOptIn}
              onCheckedChange={(checked) => setDoubleOptIn(checked as boolean)}
            />
            <Label htmlFor="double_opt_in">
              Require double opt-in confirmation for these subscribers
            </Label>
          </div>

          <div>
            <Label htmlFor="consent_text">
              Consent text or description (optional)
            </Label>
            <Textarea
              id="consent_text"
              placeholder="Describe how consent was obtained, include any relevant details..."
              value={consentText}
              onChange={(e) => setConsentText(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">AWS SES Compliance Requirements</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Only send emails to recipients who explicitly opted in</li>
            <li>• Maintain records of how each email address was obtained</li>
            <li>• Include clear unsubscribe mechanisms in all emails</li>
            <li>• Monitor bounce and complaint rates closely</li>
            <li>• Honor unsubscribe requests within 10 business days</li>
          </ul>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="acknowledge" 
            checked={acknowledged}
            onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
          />
          <Label htmlFor="acknowledge" className="text-sm">
            I acknowledge that I have obtained proper consent from all subscribers 
            and understand the compliance requirements for email marketing.
          </Label>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleSubmit}
            disabled={!verificationMethod || !acknowledged}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Verify Consent & Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}