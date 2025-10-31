'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
export default function PrivacyVerifyPage() {
    const searchParams = useSearchParams();
    const [verifying, setVerifying] = useState(true);
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState('');
    const requestId = searchParams.get('request');
    const token = searchParams.get('token');
    useEffect(() => {
        if (requestId && token) {
            verifyRequest();
        }
        else {
            setError('Invalid verification link');
            setVerifying(false);
        }
    }, [requestId, token]);
    const verifyRequest = async () => {
        try {
            const response = await fetch('/api/privacy/data-requests/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requestId,
                    verificationToken: token
                }),
            });
            if (!response.ok) {
                throw new Error('Verification failed');
            }
            const result = await response.json();
            if (result.verified) {
                setVerified(true);
            }
            else {
                setError('Verification failed');
            }
        }
        catch (error) {
            console.error('Verification error:', error);
            setError('Verification failed. The link may be invalid or expired.');
        }
        finally {
            setVerifying(false);
        }
    };
    return (<div className="container mx-auto py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {verifying && <Loader2 className="h-5 w-5 animate-spin"/>}
              {verified && <CheckCircle className="h-5 w-5 text-green-600"/>}
              {error && <AlertTriangle className="h-5 w-5 text-red-600"/>}
              Data Subject Request Verification
            </CardTitle>
            <CardDescription>
              Verifying your identity for privacy request processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {verifying && (<div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4"/>
                <p>Verifying your request...</p>
              </div>)}

            {verified && (<Alert>
                <CheckCircle className="h-4 w-4"/>
                <AlertDescription>
                  <div className="space-y-2">
                    <p><strong>Verification Successful!</strong></p>
                    <p>Your identity has been verified for request ID: <strong>{requestId}</strong></p>
                    <p>We will now process your data subject request and respond within 30 days as required by applicable privacy regulations.</p>
                    <p className="text-sm text-muted-foreground">
                      You will receive an email notification when your request has been processed.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>)}

            {error && (<Alert variant="destructive">
                <AlertTriangle className="h-4 w-4"/>
                <AlertDescription>
                  <div className="space-y-2">
                    <p><strong>Verification Failed</strong></p>
                    <p>{error}</p>
                    <p className="text-sm">
                      If you believe this is an error, please contact our Data Protection Officer or submit a new request.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>)}

            {(verified || error) && (<div className="flex justify-center pt-4">
                <Button variant="outline" onClick={() => window.close()}>
                  Close Window
                </Button>
              </div>)}
          </CardContent>
        </Card>
      </div>
    </div>);
}
