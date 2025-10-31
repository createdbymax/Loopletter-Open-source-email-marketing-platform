'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Trash2, Edit, Shield, Eye, CheckCircle, AlertTriangle } from 'lucide-react';
interface DataSubjectRequestFormProps {
    artistId: string;
    onRequestSubmitted?: (requestId: string) => void;
}
export function DataSubjectRequestForm({ artistId, onRequestSubmitted }: DataSubjectRequestFormProps) {
    const [formData, setFormData] = useState({
        email: '',
        request_type: '',
        regulation: 'GDPR',
        request_details: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [requestId, setRequestId] = useState('');
    const [error, setError] = useState('');
    const requestTypes = [
        {
            value: 'access',
            label: 'Access My Data',
            description: 'Request a copy of all personal data we have about you',
            icon: <Eye className="h-4 w-4"/>,
            regulation: 'GDPR Article 15'
        },
        {
            value: 'rectification',
            label: 'Correct My Data',
            description: 'Request correction of inaccurate or incomplete personal data',
            icon: <Edit className="h-4 w-4"/>,
            regulation: 'GDPR Article 16'
        },
        {
            value: 'erasure',
            label: 'Delete My Data',
            description: 'Request deletion of your personal data (Right to be Forgotten)',
            icon: <Trash2 className="h-4 w-4"/>,
            regulation: 'GDPR Article 17'
        },
        {
            value: 'portability',
            label: 'Export My Data',
            description: 'Request your data in a portable, machine-readable format',
            icon: <Download className="h-4 w-4"/>,
            regulation: 'GDPR Article 20'
        },
        {
            value: 'restriction',
            label: 'Restrict Processing',
            description: 'Request limitation of processing of your personal data',
            icon: <Shield className="h-4 w-4"/>,
            regulation: 'GDPR Article 18'
        },
        {
            value: 'objection',
            label: 'Object to Processing',
            description: 'Object to the processing of your personal data',
            icon: <AlertTriangle className="h-4 w-4"/>,
            regulation: 'GDPR Article 21'
        }
    ];
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.request_type) {
            setError('Please fill in all required fields');
            return;
        }
        try {
            setSubmitting(true);
            setError('');
            const response = await fetch('/api/privacy/data-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    artistId
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to submit request');
            }
            const result = await response.json();
            setRequestId(result.request_id);
            setSubmitted(true);
            if (onRequestSubmitted) {
                onRequestSubmitted(result.request_id);
            }
        }
        catch (error) {
            console.error('Error submitting request:', error);
            setError('Failed to submit request. Please try again.');
        }
        finally {
            setSubmitting(false);
        }
    };
    if (submitted) {
        return (<Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600"/>
            Request Submitted Successfully
          </CardTitle>
          <CardDescription>
            Your data subject request has been submitted and is being processed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4"/>
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Request ID:</strong> {requestId}</p>
                <p>We've sent a verification email to <strong>{formData.email}</strong></p>
                <p>Please check your email and click the verification link to confirm your identity.</p>
                <p className="text-sm text-muted-foreground">
                  We will process your request within 30 days as required by {formData.regulation} regulations.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
                setSubmitted(false);
                setFormData({
                    email: '',
                    request_type: '',
                    regulation: 'GDPR',
                    request_details: ''
                });
            }}>
              Submit Another Request
            </Button>
          </div>
        </CardContent>
      </Card>);
    }
    return (<Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5"/>
          Data Subject Request
        </CardTitle>
        <CardDescription>
          Exercise your privacy rights under GDPR and CCPA regulations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="Enter the email address associated with your account" required/>
            <p className="text-xs text-muted-foreground">
              This must match the email address in our records
            </p>
          </div>

          
          <div className="space-y-2">
            <Label>Applicable Regulation</Label>
            <RadioGroup value={formData.regulation} onValueChange={(value) => setFormData(prev => ({ ...prev, regulation: value }))}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="GDPR" id="gdpr"/>
                <Label htmlFor="gdpr">GDPR (General Data Protection Regulation)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CCPA" id="ccpa"/>
                <Label htmlFor="ccpa">CCPA (California Consumer Privacy Act)</Label>
              </div>
            </RadioGroup>
          </div>

          
          <div className="space-y-2">
            <Label>Type of Request *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {requestTypes.map((type) => (<div key={type.value} className={`p-3 border rounded-lg cursor-pointer transition-colors ${formData.request_type === type.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'}`} onClick={() => setFormData(prev => ({ ...prev, request_type: type.value }))}>
                  <div className="flex items-start space-x-3">
                    {type.icon}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{type.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {type.description}
                      </div>
                      <div className="text-xs text-primary mt-1">
                        {type.regulation}
                      </div>
                    </div>
                  </div>
                </div>))}
            </div>
          </div>

          
          <div className="space-y-2">
            <Label htmlFor="details">Additional Details (Optional)</Label>
            <Textarea id="details" value={formData.request_details} onChange={(e) => setFormData(prev => ({ ...prev, request_details: e.target.value }))} placeholder="Provide any additional information about your request..." rows={4}/>
          </div>

          
          {error && (<Alert variant="destructive">
              <AlertTriangle className="h-4 w-4"/>
              <AlertDescription>{error}</AlertDescription>
            </Alert>)}

          
          <Alert>
            <Shield className="h-4 w-4"/>
            <AlertDescription className="text-xs">
              <div className="space-y-2">
                <p><strong>Important:</strong> To protect your privacy, we will verify your identity before processing your request.</p>
                <p>You will receive a verification email that must be confirmed within 24 hours.</p>
                <p>We will respond to your request within 30 days as required by applicable privacy laws.</p>
                <p>False or fraudulent requests may be subject to legal action.</p>
              </div>
            </AlertDescription>
          </Alert>

          
          <Button type="submit" className="w-full" disabled={submitting || !formData.email || !formData.request_type}>
            {submitting ? 'Submitting Request...' : 'Submit Data Subject Request'}
          </Button>
        </form>
      </CardContent>
    </Card>);
}
