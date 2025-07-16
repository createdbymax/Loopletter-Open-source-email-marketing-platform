"use client";
import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { getOrCreateArtistByClerkId, updateArtist } from "@/lib/db";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, Info, Loader2 } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

function StatusBadge({ status }: { status: string | null }) {
  let color = "bg-muted text-foreground";
  let label = status || "-";
  if (status === "pending") color = "bg-yellow-200 text-yellow-900";
  if (status === "verified" || status === "Success") color = "bg-green-200 text-green-900";
  if (status === "failed") color = "bg-red-200 text-red-900";
  return <Badge className={color + " px-2 py-1 rounded text-xs font-medium"}>{label}</Badge>;
}

export function DomainLinker() {
  const { user, isLoaded } = useUser();
  const [artist, setArtist] = React.useState<any>(null);
  const [domain, setDomain] = React.useState("");
  const [dnsRecords, setDnsRecords] = React.useState<any[]>([]);
  const [config, setConfig] = React.useState<any>({ clickTracking: true, openTracking: true, tlsMode: "opportunistic" });
  const [currentDomain, setCurrentDomain] = React.useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showRemove, setShowRemove] = React.useState(false);
  const [step, setStep] = React.useState<0 | 1 | 2>(0);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Update checkStatus to accept an optional domain argument
  async function checkStatus(silent = false, explicitDomain?: string) {
    setLoading(!silent);
    setError(null);
    try {
      const domainToCheck = explicitDomain || currentDomain || domain;
      if (!domainToCheck) throw new Error('Domain is required');
      const res = await fetch(`/api/ses/domain/status?domain=${encodeURIComponent(domainToCheck)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setDnsRecords(data.records);
      setConfig(data.config);
      // Use SES TXT status for main status
      const sesTxt = data.records.find((r: any) => r.type === "TXT" && r.name.startsWith("_amazonses"));
      setCurrentStatus(sesTxt?.status || null);
      if (sesTxt?.status === "Success" || sesTxt?.status === "verified") {
        await updateArtist(artist.id, { ses_status: "verified" });
        setStep(2);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    async function fetchArtist() {
      if (!user) return;
      const a = await getOrCreateArtistByClerkId(
        user.id,
        user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || "",
        user.fullName || user.username || "Artist"
      );
      setArtist(a);
      setCurrentDomain(a.ses_domain || null);
      setCurrentStatus(a.ses_status || null);
      if (a.ses_domain) {
        setStep(a.ses_status === "verified" ? 2 : 1);
        // Immediately fetch DNS records and status with the correct domain
        checkStatus(true, a.ses_domain);
      } else setStep(0);
    }
    if (isLoaded) fetchArtist();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [user, isLoaded]);

  // Always check status immediately and then every 5s if domain is linked and not verified
  React.useEffect(() => {
    if (currentDomain && currentStatus !== "verified") {
      // Check immediately
      checkStatus(true);
      // Then set interval
      intervalRef.current = setInterval(() => checkStatus(true), 5000);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [currentDomain, currentStatus]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!artist) return;
    setLoading(true);
    setError(null);
    setDnsRecords([]);
    try {
      const res = await fetch("/api/ses/domain/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setDnsRecords(data.dns);
      await updateArtist(artist.id, { ses_domain: domain, ses_status: "pending" });
      setCurrentDomain(domain);
      setCurrentStatus("pending");
      setStep(1);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveDomain() {
    if (!artist) return;
    setLoading(true);
    setError(null);
    try {
      await updateArtist(artist.id, { ses_domain: null, ses_status: null });
      setCurrentDomain(null);
      setCurrentStatus(null);
      setDnsRecords([]);
      setStep(0);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setShowRemove(false);
    }
  }

  function copyToClipboard(val: string) {
    navigator.clipboard.writeText(val);
  }

  if (!isLoaded || !artist) return <div>Loading...</div>;

  return (
    <TooltipProvider>
      <div className="w-full mx-auto space-y-6">
        <div className="mb-4">
          <div className="font-semibold text-lg flex items-center gap-2 mb-1">
            Domain Setup
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="max-w-xs text-xs">
                  Connect your own domain to send emails from your brand. This process requires adding several DNS records to your domain provider (e.g., GoDaddy, Namecheap, Cloudflare).<br /><br />
                  <a href="https://docs.aws.amazon.com/ses/latest/dg/creating-identities.html" target="_blank" rel="noopener noreferrer" className="underline">Learn more</a>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>Current Domain:</span>
            <span className="font-mono">{currentDomain || <span className="italic">None linked</span>}</span>
            {currentDomain && <Button variant="outline" onClick={() => setShowRemove(true)}>Remove</Button>}
            <StatusBadge status={currentStatus} />
          </div>
        </div>

        {/* DNS Records Table: show whenever a domain is linked */}
        {currentDomain && (
          <div className="bg-muted/50 border rounded p-4 space-y-3 mb-4">
            <div className="flex items-center gap-2 font-medium">
              Required DNS Records for Email Sending ({currentDomain})
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  Log in to your domain provider and ensure all of these DNS records are present. These are the only records required for sending email with SES. It may take a few minutes to propagate changes.
                </TooltipContent>
              </Tooltip>
            </div>
            {/* Auto-refresh indicator */}
            {currentDomain && currentStatus !== "verified" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Auto-refreshing every 5s
              </div>
            )}
            {dnsRecords.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Host / Name</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>TTL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dnsRecords.map((rec, i) => (
                    <TableRow key={i}>
                      <TableCell>{rec.type}</TableCell>
                      <TableCell className="font-mono text-xs">{rec.name}</TableCell>
                      <TableCell className="font-mono text-xs max-w-[180px] overflow-x-auto">
                        {rec.value}
                        <Button size="icon" variant="ghost" onClick={() => copyToClipboard(rec.value)}><Copy className="w-3 h-3" /></Button>
                      </TableCell>
                      <TableCell>{rec.priority ?? "-"}</TableCell>
                      <TableCell>{rec.ttl}</TableCell>
                      <TableCell><StatusBadge status={rec.status} /></TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => copyToClipboard(rec.name)}><Copy className="w-3 h-3" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-xs text-muted-foreground">No DNS records to display.</div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Button onClick={() => checkStatus()} disabled={loading} size="sm">
                {loading ? "Checking..." : "Check Verification Status"}
              </Button>
              <span className="text-xs text-muted-foreground">(Auto-refreshes every 5s)</span>
            </div>
            {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
          </div>
        )}

        {/* Step 0: Enter domain */}
        {step === 0 && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-muted/50 border rounded p-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="yourdomain.com"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                disabled={loading}
                className="flex-1"
                required
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  Enter the domain you want to use for sending emails (e.g., myband.com).
                </TooltipContent>
              </Tooltip>
            </div>
            <Button type="submit" disabled={loading || !domain} className="w-fit">
              {loading ? "Starting..." : "Start Verification"}
            </Button>
            {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
          </form>
        )}

        {/* Step 2: Verified */}
        {step === 2 && (
          <div className="bg-green-50 border border-green-200 rounded p-4 flex items-center gap-3">
            <div className="flex-1">
              <div className="font-medium text-green-900 mb-1">Domain Verified!</div>
              <div className="text-xs text-green-800">Your domain is now verified and ready to send emails.</div>
            </div>
            <StatusBadge status={currentStatus} />
            <Button variant="outline" onClick={() => setShowRemove(true)}>Remove Domain</Button>
          </div>
        )}

        {/* Configuration Section */}
        {currentDomain && (
          <div className="bg-muted/50 border rounded p-4 space-y-4">
            <div className="font-semibold text-base flex items-center gap-2">
              Configuration
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="max-w-xs text-xs">
                    <b>Click Tracking:</b> Each link in your emails is replaced with a tracking link to measure clicks.<br /><br />
                    <b>Open Tracking:</b> A 1x1 pixel image is inserted in each email to measure opens. This can be inaccurate and may affect deliverability.<br /><br />
                    <b>TLS:</b> Opportunistic TLS attempts secure delivery, Enforced TLS requires it (may reduce deliverability).
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Label htmlFor="clickTracking">Click Tracking</Label>
                <Switch id="clickTracking" checked={config.clickTracking} disabled readOnly />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent side="right">Track clicks on links in your emails.</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="openTracking">Open Tracking</Label>
                <Switch id="openTracking" checked={config.openTracking} disabled readOnly />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent side="right">Track opens using a tracking pixel.</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="tlsMode">TLS Mode</Label>
                <select id="tlsMode" value={config.tlsMode} disabled className="bg-background border rounded px-2 py-1 text-xs">
                  <option value="opportunistic">Opportunistic TLS</option>
                  <option value="enforced">Enforced TLS</option>
                </select>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent side="right">Opportunistic TLS is recommended for best deliverability.</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        )}

        {/* Remove domain dialog */}
        <AlertDialog open={showRemove} onOpenChange={setShowRemove}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Domain?</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="text-sm">This will unlink your domain and you will need to verify again to send emails from your brand.</div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemoveDomain} disabled={loading}>
                {loading ? "Removing..." : "Remove"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
} 