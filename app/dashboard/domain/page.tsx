"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getOrCreateArtistByClerkId, updateArtist } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Globe, CheckCircle, XCircle, AlertTriangle, Copy, RefreshCw, Shield, Mail, Settings, ExternalLink, Server, TrendingUp, Eye, AlertCircle, } from "lucide-react";
import type { Artist } from "@/lib/types";
interface DomainVerificationStatus {
    domain: string;
    verified: boolean;
    dkimTokens: string[];
    spfRecord: string;
    dmarcRecord: string;
    mxRecord: string;
    verificationToken: string;
}
interface ReputationData {
    domain: string;
    domainReputation: {
        score: number;
        status: string;
    };
    ipReputation: {
        score: number;
        status: string;
        address: string;
        type: string;
    };
    metrics: {
        bounceRate: number;
        complaintRate: number;
        openRate: number;
        clickRate: number;
        period: string;
        totalSent: number;
        totalBounces: number;
        totalComplaints: number;
        totalRejects: number;
    };
    blacklists: {
        total: number;
        listed: number;
        status: Array<{
            name: string;
            listed: boolean;
            lastChecked: string;
        }>;
        lastChecked: string;
    };
    ispFeedback: Array<{
        name: string;
        connected: boolean;
        complaints: number;
    }>;
    authentication: {
        spf: {
            verified: boolean;
            record: string;
        };
        dkim: {
            verified: boolean;
            selector: string;
            enabled: boolean;
        };
        dmarc: {
            verified: boolean;
            policy: string;
            record: string;
        };
    };
    sesStatus: {
        sendingEnabled: boolean;
        sendQuota: number;
        sendRate: number;
        sentLast24Hours: number;
    };
    lastUpdated: string;
}
export default function DomainPage() {
    const { user, isLoaded } = useUser();
    const [artist, setArtist] = useState<Artist | null>(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [domainInput, setDomainInput] = useState("");
    const [verificationStatus, setVerificationStatus] = useState<DomainVerificationStatus | null>(null);
    const [reputationData, setReputationData] = useState<ReputationData | null>(null);
    const [loadingReputation, setLoadingReputation] = useState(false);
    useEffect(() => {
        async function fetchArtist() {
            if (!user)
                return;
            setLoading(true);
            try {
                const a = await getOrCreateArtistByClerkId(user.id, user.primaryEmailAddress?.emailAddress || "", user.fullName || user.username || "Artist");
                setArtist(a);
                setDomainInput(a.ses_domain || "");
                if (a.ses_domain) {
                    await checkDomainStatus(a.ses_domain);
                    await fetchReputationData();
                }
            }
            catch (error) {
                console.error("Error fetching artist:", error);
            }
            finally {
                setLoading(false);
            }
        }
        if (isLoaded)
            fetchArtist();
    }, [user, isLoaded]);
    const checkDomainStatus = async (domain: string) => {
        try {
            const response = await fetch(`/api/ses/domain/verify?domain=${domain}`);
            const data = await response.json();
            setVerificationStatus(data);
        }
        catch (error) {
            console.error("Error checking domain status:", error);
        }
    };
    const fetchReputationData = async () => {
        if (!artist?.ses_domain)
            return;
        setLoadingReputation(true);
        try {
            const response = await fetch('/api/domain/reputation');
            if (response.ok) {
                const data = await response.json();
                setReputationData(data);
            }
        }
        catch (error) {
            console.error("Error fetching reputation data:", error);
        }
        finally {
            setLoadingReputation(false);
        }
    };
    const handleDomainSubmit = async () => {
        if (!domainInput.trim() || !artist)
            return;
        setVerifying(true);
        try {
            const response = await fetch("/api/ses/domain/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain: domainInput.trim() }),
            });
            if (response.ok) {
                const data = await response.json();
                setVerificationStatus(data);
                await updateArtist(artist.id, {
                    ses_domain: domainInput.trim(),
                    ses_status: "pending",
                });
                setArtist({
                    ...artist,
                    ses_domain: domainInput.trim(),
                    ses_status: "pending",
                });
            }
            else {
                const error = await response.json();
                alert(`Failed to add domain: ${error.message}`);
            }
        }
        catch (error) {
            console.error("Error adding domain:", error);
            alert("Failed to add domain");
        }
        finally {
            setVerifying(false);
        }
    };
    const handleVerifyDomain = async () => {
        if (!artist?.ses_domain)
            return;
        setVerifying(true);
        try {
            const response = await fetch("/api/ses/domain/check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain: artist.ses_domain }),
            });
            if (response.ok) {
                const data = await response.json();
                if (data.verified) {
                    await updateArtist(artist.id, {
                        ses_domain_verified: true,
                        ses_status: "verified",
                    });
                    setArtist({
                        ...artist,
                        ses_domain_verified: true,
                        ses_status: "verified",
                    });
                    alert("Domain verified successfully!");
                }
                else {
                    alert("Domain verification failed. Please check your DNS records.");
                }
                await checkDomainStatus(artist.ses_domain);
            }
        }
        catch (error) {
            console.error("Error verifying domain:", error);
            alert("Failed to verify domain");
        }
        finally {
            setVerifying(false);
        }
    };
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };
    if (loading) {
        return (<div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>);
    }
    return (<div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Domain Setup</h1>
        <p className="text-gray-600">
          Configure your sending domain for better email deliverability
        </p>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Domain Status</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {artist?.ses_domain_verified ? (<>
                  <CheckCircle className="w-5 h-5 text-green-500"/>
                  <Badge className="bg-green-100 text-green-800">
                    Verified
                  </Badge>
                </>) : artist?.ses_domain ? (<>
                  <AlertTriangle className="w-5 h-5 text-yellow-500"/>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Pending
                  </Badge>
                </>) : (<>
                  <XCircle className="w-5 h-5 text-red-500"/>
                  <Badge variant="secondary">Not Set</Badge>
                </>)}
            </div>
            {artist?.ses_domain && (<p className="text-sm text-gray-600 mt-2">{artist.ses_domain}</p>)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Email Authentication
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500"/>
                <span>SPF Record</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500"/>
                <span>DKIM Signing</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-yellow-500"/>
                <span>DMARC Policy</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sending Status
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {artist?.ses_domain_verified ? "Ready" : "Blocked"}
            </div>
            <p className="text-xs text-gray-600">
              {artist?.ses_domain_verified
            ? "You can send campaigns"
            : "Complete domain setup to send emails"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="setup" className="space-y-4">
        <TabsList>
          <TabsTrigger value="setup">Domain Setup</TabsTrigger>
          <TabsTrigger value="dns">DNS Records</TabsTrigger>
          <TabsTrigger value="reputation">Reputation & IP</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="deliverability">Best Practices</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Your Domain</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!artist?.ses_domain ? (<>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Domain Name
                    </label>
                    <div className="flex gap-2">
                      <Input value={domainInput} onChange={(e) => setDomainInput(e.target.value)} placeholder="yourdomain.com" className="flex-1"/>
                      <Button onClick={handleDomainSubmit} disabled={!domainInput.trim() || verifying}>
                        {verifying ? (<RefreshCw className="w-4 h-4 animate-spin"/>) : ("Add Domain")}
                      </Button>
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4"/>
                    <AlertDescription>
                      You must own this domain and have access to modify its DNS
                      records. We'll provide the necessary DNS records after you
                      add the domain.
                    </AlertDescription>
                  </Alert>
                </>) : (<div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{artist.ses_domain}</h3>
                      <p className="text-sm text-gray-600">
                        Status:{" "}
                        {artist.ses_domain_verified
                ? "Verified"
                : "Pending Verification"}
                      </p>
                    </div>

                    {!artist.ses_domain_verified && (<Button onClick={handleVerifyDomain} disabled={verifying}>
                        {verifying ? (<RefreshCw className="w-4 h-4 animate-spin mr-2"/>) : (<CheckCircle className="w-4 h-4 mr-2"/>)}
                        Verify Domain
                      </Button>)}
                  </div>

                  {!artist.ses_domain_verified && (<Alert>
                      <AlertTriangle className="h-4 w-4"/>
                      <AlertDescription>
                        Please add the DNS records shown in the "DNS Records"
                        tab, then click "Verify Domain". Verification can take
                        up to 72 hours after DNS propagation.
                      </AlertDescription>
                    </Alert>)}
                </div>)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dns" className="space-y-4">
          {verificationStatus ? (<div className="space-y-4">
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5"/>
                    DKIM Records
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Add these CNAME records to enable DKIM signing:
                  </p>
                  {verificationStatus.dkimTokens.map((token, index) => (<div key={index} className="bg-gray-50 p-3 rounded border">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <strong>Name:</strong>
                          <div className="font-mono bg-white p-1 rounded mt-1">
                            {token}._domainkey.{verificationStatus.domain}
                          </div>
                        </div>
                        <div>
                          <strong>Type:</strong>
                          <div className="font-mono bg-white p-1 rounded mt-1">
                            CNAME
                          </div>
                        </div>
                        <div>
                          <strong>Value:</strong>
                          <div className="font-mono bg-white p-1 rounded mt-1 flex items-center gap-2">
                            <span className="flex-1">
                              {token}.dkim.amazonses.com
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`${token}.dkim.amazonses.com`)}>
                              <Copy className="w-4 h-4"/>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>))}
                </CardContent>
              </Card>

              
              <Card>
                <CardHeader>
                  <CardTitle>SPF Record</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Add or update your TXT record for SPF:
                  </p>
                  <div className="bg-gray-50 p-3 rounded border">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong>Name:</strong>
                        <div className="font-mono bg-white p-1 rounded mt-1">
                          {verificationStatus.domain}
                        </div>
                      </div>
                      <div>
                        <strong>Type:</strong>
                        <div className="font-mono bg-white p-1 rounded mt-1">
                          TXT
                        </div>
                      </div>
                      <div>
                        <strong>Value:</strong>
                        <div className="font-mono bg-white p-1 rounded mt-1 flex items-center gap-2">
                          <span className="flex-1">
                            {verificationStatus.spfRecord}
                          </span>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(verificationStatus.spfRecord)}>
                            <Copy className="w-4 h-4"/>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              
              <Card>
                <CardHeader>
                  <CardTitle>DMARC Record (Recommended)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Add this TXT record for DMARC policy:
                  </p>
                  <div className="bg-gray-50 p-3 rounded border">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong>Name:</strong>
                        <div className="font-mono bg-white p-1 rounded mt-1">
                          _dmarc.{verificationStatus.domain}
                        </div>
                      </div>
                      <div>
                        <strong>Type:</strong>
                        <div className="font-mono bg-white p-1 rounded mt-1">
                          TXT
                        </div>
                      </div>
                      <div>
                        <strong>Value:</strong>
                        <div className="font-mono bg-white p-1 rounded mt-1 flex items-center gap-2">
                          <span className="flex-1">
                            {verificationStatus.dmarcRecord}
                          </span>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(verificationStatus.dmarcRecord)}>
                            <Copy className="w-4 h-4"/>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              
              <Card>
                <CardHeader>
                  <CardTitle>Domain Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Add this TXT record to verify domain ownership:
                  </p>
                  <div className="bg-gray-50 p-3 rounded border">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong>Name:</strong>
                        <div className="font-mono bg-white p-1 rounded mt-1">
                          _amazonses.{verificationStatus.domain}
                        </div>
                      </div>
                      <div>
                        <strong>Type:</strong>
                        <div className="font-mono bg-white p-1 rounded mt-1">
                          TXT
                        </div>
                      </div>
                      <div>
                        <strong>Value:</strong>
                        <div className="font-mono bg-white p-1 rounded mt-1 flex items-center gap-2">
                          <span className="flex-1">
                            {verificationStatus.verificationToken}
                          </span>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(verificationStatus.verificationToken)}>
                            <Copy className="w-4 h-4"/>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>) : (<Card>
              <CardContent className="text-center py-12">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
                <h3 className="text-lg font-medium mb-2">
                  No Domain Configured
                </h3>
                <p className="text-gray-600">
                  Add a domain in the "Domain Setup&quot; tab to see DNS records
                </p>
              </CardContent>
            </Card>)}
        </TabsContent>

        <TabsContent value="reputation" className="space-y-6">
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Domain Reputation</h2>
              <p className="text-sm text-gray-600">Real-time AWS SES reputation monitoring</p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchReputationData} disabled={loadingReputation}>
              {loadingReputation ? (<RefreshCw className="h-4 w-4 animate-spin mr-2"/>) : (<RefreshCw className="h-4 w-4 mr-2"/>)}
              Refresh
            </Button>
          </div>

          {loadingReputation ? (<div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>) : reputationData ? (<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Domain Reputation</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${reputationData.domainReputation.score >= 90 ? 'text-green-600' :
                reputationData.domainReputation.score >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {reputationData.domainReputation.score}/100
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {reputationData.domainReputation.status}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className={`h-2 rounded-full ${reputationData.domainReputation.score >= 90 ? 'bg-green-500' :
                reputationData.domainReputation.score >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${reputationData.domainReputation.score}%` }}></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">IP Reputation</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${reputationData.ipReputation.score >= 90 ? 'text-green-600' :
                reputationData.ipReputation.score >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {reputationData.ipReputation.score}/100
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {reputationData.ipReputation.status}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className={`h-2 rounded-full ${reputationData.ipReputation.score >= 90 ? 'bg-green-500' :
                reputationData.ipReputation.score >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${reputationData.ipReputation.score}%` }}></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blacklist Status</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {reputationData.blacklists.listed === 0 ? (<CheckCircle className="h-5 w-5 text-green-500"/>) : (<AlertCircle className="h-5 w-5 text-red-500"/>)}
                    <span className="text-sm font-medium">
                      {reputationData.blacklists.listed === 0 ? 'Clean' : 'Listed'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {reputationData.blacklists.listed}/{reputationData.blacklists.total} blacklists
                  </p>
                </CardContent>
              </Card>
            </div>) : (<Card>
              <CardContent className="text-center py-12">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
                <h3 className="text-lg font-medium mb-2">No Reputation Data</h3>
                <p className="text-gray-600">Add and verify a domain to see reputation metrics</p>
              </CardContent>
            </Card>)}

          

          
          {reputationData && (<Card>
              <CardHeader>
                <CardTitle>Dedicated IP Address</CardTitle>
                <p className="text-sm text-gray-600">
                  Your dedicated IP for maximum reputation control
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <div className="font-medium">Current IP: {reputationData.ipReputation.address}</div>
                    <div className="text-sm text-gray-600">
                      Reputation Score: {reputationData.ipReputation.score}/100 • Warmed Up
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 capitalize">
                    {reputationData.ipReputation.type}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline">
                    <Server className="h-4 w-4 mr-2"/>
                    Request Additional IP
                  </Button>
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2"/>
                    IP Warm-up Plan
                  </Button>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2"/>
                    View IP History
                  </Button>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4"/>
                  <AlertDescription>
                    Dedicated IPs give you full control over your sending reputation.
                    Consider requesting additional IPs if you send high volumes or want to segment campaigns.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>)}

          
          {reputationData && (<Card>
              <CardHeader>
                <CardTitle>Authentication & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {reputationData.authentication.spf.verified ? (<CheckCircle className="h-4 w-4 text-green-500"/>) : (<AlertTriangle className="h-4 w-4 text-yellow-500"/>)}
                      <span className="font-medium">SPF</span>
                    </div>
                    <Badge className={reputationData.authentication.spf.verified ?
                "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {reputationData.authentication.spf.verified ? "Verified" : "Pending"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {reputationData.authentication.dkim.verified ? (<CheckCircle className="h-4 w-4 text-green-500"/>) : (<AlertTriangle className="h-4 w-4 text-yellow-500"/>)}
                      <span className="font-medium">DKIM</span>
                    </div>
                    <Badge className={reputationData.authentication.dkim.verified ?
                "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {reputationData.authentication.dkim.verified ? "Verified" : "Pending"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {reputationData.authentication.dmarc.verified ? (<CheckCircle className="h-4 w-4 text-green-500"/>) : (<AlertTriangle className="h-4 w-4 text-yellow-500"/>)}
                      <span className="font-medium">DMARC</span>
                    </div>
                    <Badge className={reputationData.authentication.dmarc.verified ?
                "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {reputationData.authentication.dmarc.verified ? "Verified" : "Recommended"}
                    </Badge>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">DMARC Setup Recommended</h4>
                  <p className="text-sm text-yellow-800 mb-3">
                    Adding a DMARC policy will further improve your domain reputation and protect against spoofing.
                  </p>
                  <Button size="sm" variant="outline">
                    Set Up DMARC
                  </Button>
                </div>
              </CardContent>
            </Card>)}

          
          <Card>
            <CardHeader>
              <CardTitle>Advanced Reputation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Automatic List Cleaning</h4>
                  <p className="text-sm text-gray-600">
                    Automatically remove bounced and complained addresses
                  </p>
                </div>
                <Switch defaultChecked/>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Reputation Monitoring</h4>
                  <p className="text-sm text-gray-600">
                    Real-time monitoring of domain and IP reputation
                  </p>
                </div>
                <Switch defaultChecked/>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Feedback Loop Processing</h4>
                  <p className="text-sm text-gray-600">
                    Process ISP feedback loops automatically
                  </p>
                </div>
                <Switch defaultChecked/>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Reputation Alerts</h4>
                  <p className="text-sm text-gray-600">
                    Get notified when reputation scores drop
                  </p>
                </div>
                <Switch defaultChecked/>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          
          {loadingReputation ? (<div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>) : reputationData ? (<>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground"/>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${reputationData.metrics.bounceRate <= 3 ? 'text-green-600' :
                reputationData.metrics.bounceRate <= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {reputationData.metrics.bounceRate}%
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">
                      {reputationData.metrics.period.replace('_', ' ')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Complaint Rate</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground"/>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${reputationData.metrics.complaintRate <= 0.1 ? 'text-green-600' :
                reputationData.metrics.complaintRate <= 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {reputationData.metrics.complaintRate}%
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">
                      {reputationData.metrics.period.replace('_', ' ')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground"/>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reputationData.metrics.openRate}%</div>
                    <p className="text-xs text-muted-foreground capitalize">
                      {reputationData.metrics.period.replace('_', ' ')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground"/>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reputationData.metrics.clickRate}%</div>
                    <p className="text-xs text-muted-foreground capitalize">
                      {reputationData.metrics.period.replace('_', ' ')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              
              <Card>
                <CardHeader>
                  <CardTitle>Blacklist Monitoring</CardTitle>
                  <p className="text-sm text-gray-600">
                    Real-time monitoring across major email blacklists
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reputationData.blacklists.status.map((blacklist) => (<div key={blacklist.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm font-medium">{blacklist.name}</span>
                        <div className="flex items-center gap-2">
                          {blacklist.listed ? (<AlertCircle className="h-4 w-4 text-red-500"/>) : (<CheckCircle className="h-4 w-4 text-green-500"/>)}
                          <span className={`text-xs ${blacklist.listed ? 'text-red-600' : 'text-green-600'}`}>
                            {blacklist.listed ? 'Listed' : 'Clean'}
                          </span>
                        </div>
                      </div>))}
                  </div>

                  <div className={`border rounded-lg p-4 ${reputationData.blacklists.listed === 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {reputationData.blacklists.listed === 0 ? (<CheckCircle className="h-4 w-4 text-green-600"/>) : (<AlertCircle className="h-4 w-4 text-red-600"/>)}
                      <span className={`font-medium ${reputationData.blacklists.listed === 0 ? 'text-green-900' : 'text-red-900'}`}>
                        {reputationData.blacklists.listed === 0 ? 'All Clear' : `${reputationData.blacklists.listed} Issues Found`}
                      </span>
                    </div>
                    <p className={`text-sm ${reputationData.blacklists.listed === 0 ? 'text-green-800' : 'text-red-800'}`}>
                      {reputationData.blacklists.listed === 0
                ? `Your domain and IP are not listed on any major blacklists. Last checked: ${new Date(reputationData.blacklists.lastChecked).toLocaleString()}`
                : `Your domain or IP is listed on ${reputationData.blacklists.listed} blacklist(s). Please review and take action.`}
                    </p>
                  </div>
                </CardContent>
              </Card>

              
              <Card>
                <CardHeader>
                  <CardTitle>ISP Feedback Loops</CardTitle>
                  <p className="text-sm text-gray-600">
                    Connected feedback loops for complaint monitoring
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reputationData.ispFeedback.map((isp) => (<div key={isp.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">{isp.name}</span>
                          <p className="text-xs text-gray-600">{isp.complaints} complaints this month</p>
                        </div>
                        <Badge className={isp.connected ?
                    "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {isp.connected ? "Connected" : "Not Connected"}
                        </Badge>
                      </div>))}
                  </div>
                </CardContent>
              </Card>

              
              <Card>
                <CardHeader>
                  <CardTitle>Reputation Trends</CardTitle>
                  <p className="text-sm text-gray-600">
                    Track your domain and IP reputation over time
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 mx-auto text-gray-400 mb-4"/>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Reputation Charts Coming Soon
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Visual reputation tracking and trend analysis will be available soon.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                      <h4 className="font-medium text-blue-900 mb-2">Planned Features:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Historical reputation score charts</li>
                        <li>• Bounce and complaint rate trends</li>
                        <li>• Deliverability performance metrics</li>
                        <li>• Comparative ISP performance</li>
                        <li>• Automated reputation reports</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>) : (<Card>
              <CardContent className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
                <h3 className="text-lg font-medium mb-2">No Monitoring Data</h3>
                <p className="text-gray-600">Add and verify a domain to see monitoring metrics</p>
              </CardContent>
            </Card>)}
        </TabsContent>

        <TabsContent value="deliverability" className="space-y-6">
          
          <Card>
            <CardHeader>
              <CardTitle>Email Deliverability Best Practices</CardTitle>
              <p className="text-sm text-gray-600">
                Follow these guidelines to maintain high deliverability rates
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Authentication Setup</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"/>
                      <span>Configure SPF records to authorize sending servers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"/>
                      <span>Enable DKIM signing for message authentication</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"/>
                      <span>Set up DMARC policy for domain protection</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Content Guidelines</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0"/>
                      <span>Avoid spam trigger words and excessive punctuation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0"/>
                      <span>Maintain proper text-to-image ratio</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0"/>
                      <span>Include clear unsubscribe links</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Useful Tools</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <a href="https://mxtoolbox.com/dkim.aspx" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <ExternalLink className="w-4 h-4"/>
                    DKIM Record Checker
                  </a>
                  <a href="https://mxtoolbox.com/spf.aspx" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <ExternalLink className="w-4 h-4"/>
                    SPF Record Checker
                  </a>
                  <a href="https://dmarcian.com/dmarc-inspector/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <ExternalLink className="w-4 h-4"/>
                    DMARC Inspector
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>);
}
