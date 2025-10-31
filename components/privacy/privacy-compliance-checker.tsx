'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield, AlertTriangle, CheckCircle, Info, FileText, Users, Clock } from 'lucide-react';
interface PrivacyComplianceCheckerProps {
    artistId: string;
    fanCount?: number;
    importSource?: 'csv' | 'manual' | 'api';
    onComplianceCheck?: (compliant: boolean, requirements: string[]) => void;
}
export function PrivacyComplianceChecker({ artistId, fanCount = 0, importSource = 'manual', onComplianceCheck }: PrivacyComplianceCheckerProps) {
    const [complianceChecks, setComplianceChecks] = useState({
        consentVerified: false,
        privacyPolicyProvided: false,
        legalBasisDocumented: false,
        dataMinimized: false,
        retentionPolicySet: false
    });
    const [loading, setLoading] = useState(false);
    const [requirements, setRequirements] = useState<string[]>([]);
    useEffect(() => {
        checkCompliance();
    }, [artistId, complianceChecks]);
    const checkCompliance = () => {
        const newRequirements: string[] = [];
        if (!complianceChecks.consentVerified) {
            newRequirements.push('Verify that all subscribers have given explicit consent');
        }
        if (!complianceChecks.privacyPolicyProvided) {
            newRequirements.push('Ensure privacy policy was provided at time of consent');
        }
        if (!complianceChecks.legalBasisDocumented) {
            newRequirements.push('Document legal basis for processing personal data');
        }
        if (!complianceChecks.dataMinimized) {
            newRequirements.push('Confirm only necessary data is being collected');
        }
        if (!complianceChecks.retentionPolicySet) {
            newRequirements.push('Set appropriate data retention periods');
        }
        setRequirements(newRequirements);
        const isCompliant = newRequirements.length === 0;
        if (onComplianceCheck) {
            onComplianceCheck(isCompliant, newRequirements);
        }
    };
    const handleCheckChange = (check: keyof typeof complianceChecks, checked: boolean) => {
        setComplianceChecks(prev => ({
            ...prev,
            [check]: checked
        }));
    };
    const getComplianceScore = () => {
        const totalChecks = Object.keys(complianceChecks).length;
        const passedChecks = Object.values(complianceChecks).filter(Boolean).length;
        return Math.round((passedChecks / totalChecks) * 100);
    };
    const getSourceRiskLevel = () => {
        switch (importSource) {
            case 'csv':
                return { level: 'high', color: 'text-red-600', description: 'CSV imports require extra verification' };
            case 'api':
                return { level: 'medium', color: 'text-yellow-600', description: 'API imports need consent validation' };
            case 'manual':
                return { level: 'low', color: 'text-green-600', description: 'Manual entry allows consent collection' };
            default:
                return { level: 'unknown', color: 'text-gray-600', description: 'Unknown import source' };
        }
    };
    const complianceScore = getComplianceScore();
    const riskLevel = getSourceRiskLevel();
    const isCompliant = requirements.length === 0;
    return (<Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5"/>
          Privacy Compliance Check
        </CardTitle>
        <CardDescription>
          Ensure GDPR and CCPA compliance before importing {fanCount} subscribers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <div className="font-medium">Compliance Score</div>
            <div className="text-sm text-muted-foreground">
              {complianceScore}% of requirements met
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-2xl font-bold ${complianceScore >= 100 ? 'text-green-600' : complianceScore >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
              {complianceScore}%
            </div>
            {isCompliant ? (<CheckCircle className="h-5 w-5 text-green-600"/>) : (<AlertTriangle className="h-5 w-5 text-yellow-600"/>)}
          </div>
        </div>

        
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <div className="font-medium">Import Risk Level</div>
            <div className="text-sm text-muted-foreground">
              {riskLevel.description}
            </div>
          </div>
          <Badge variant={riskLevel.level === 'high' ? 'destructive' : riskLevel.level === 'medium' ? 'secondary' : 'default'}>
            {riskLevel.level.toUpperCase()}
          </Badge>
        </div>

        
        <div className="space-y-4">
          <h4 className="font-medium">Compliance Requirements</h4>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox id="consent" checked={complianceChecks.consentVerified} onCheckedChange={(checked) => handleCheckChange('consentVerified', checked as boolean)}/>
              <div className="flex-1">
                <Label htmlFor="consent" className="text-sm font-medium">
                  Explicit Consent Verified
                </Label>
                <p className="text-xs text-muted-foreground">
                  All subscribers have given clear, informed consent for email marketing
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox id="privacy-policy" checked={complianceChecks.privacyPolicyProvided} onCheckedChange={(checked) => handleCheckChange('privacyPolicyProvided', checked as boolean)}/>
              <div className="flex-1">
                <Label htmlFor="privacy-policy" className="text-sm font-medium">
                  Privacy Policy Provided
                </Label>
                <p className="text-xs text-muted-foreground">
                  Privacy policy was available and presented at time of consent
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox id="legal-basis" checked={complianceChecks.legalBasisDocumented} onCheckedChange={(checked) => handleCheckChange('legalBasisDocumented', checked as boolean)}/>
              <div className="flex-1">
                <Label htmlFor="legal-basis" className="text-sm font-medium">
                  Legal Basis Documented
                </Label>
                <p className="text-xs text-muted-foreground">
                  Legal basis for processing (consent, legitimate interest, etc.) is documented
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox id="data-minimized" checked={complianceChecks.dataMinimized} onCheckedChange={(checked) => handleCheckChange('dataMinimized', checked as boolean)}/>
              <div className="flex-1">
                <Label htmlFor="data-minimized" className="text-sm font-medium">
                  Data Minimization Applied
                </Label>
                <p className="text-xs text-muted-foreground">
                  Only necessary personal data is being collected and processed
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox id="retention-policy" checked={complianceChecks.retentionPolicySet} onCheckedChange={(checked) => handleCheckChange('retentionPolicySet', checked as boolean)}/>
              <div className="flex-1">
                <Label htmlFor="retention-policy" className="text-sm font-medium">
                  Data Retention Policy Set
                </Label>
                <p className="text-xs text-muted-foreground">
                  Clear retention periods are defined and will be enforced
                </p>
              </div>
            </div>
          </div>
        </div>

        
        {requirements.length > 0 && (<Alert>
            <AlertTriangle className="h-4 w-4"/>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Compliance Requirements Not Met:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {requirements.map((req, index) => (<li key={index}>{req}</li>))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>)}

        
        {isCompliant && (<Alert>
            <CheckCircle className="h-4 w-4"/>
            <AlertDescription>
              <p className="font-medium text-green-700">
                All privacy compliance requirements have been met. You can proceed with the import.
              </p>
            </AlertDescription>
          </Alert>)}

        
        <Alert>
          <Info className="h-4 w-4"/>
          <AlertDescription className="text-xs">
            <div className="space-y-2">
              <p><strong>GDPR Compliance:</strong> Requires explicit consent, privacy policy, and documented legal basis.</p>
              <p><strong>CCPA Compliance:</strong> Requires clear disclosure of data collection and processing purposes.</p>
              <p><strong>Data Retention:</strong> Personal data will be automatically deleted or anonymized according to your retention policies.</p>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>);
}
