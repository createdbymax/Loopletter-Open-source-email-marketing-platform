"use client";
import * as React from "react";
import { getCampaignsByArtist, getEmailsSentByCampaign, getFansByArtist, getOrCreateArtistByClerkId } from "@/lib/db";
import { useUser } from "@clerk/nextjs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export function Analytics() {
  const { user, isLoaded } = useUser();
  const [campaigns, setCampaigns] = React.useState<any[]>([]); // TODO: Replace 'any' with Campaign[] if possible
  const [fans, setFans] = React.useState<any[]>([]); // TODO: Replace 'any' with Fan[] if possible
  const [emailsSent, setEmailsSent] = React.useState<Record<string, any[]>>({}); // TODO: Replace 'any' with a specific email type if possible
  const [loading, setLoading] = React.useState(true);
  const [artist, setArtist] = React.useState<any>(null); // TODO: Replace 'any' with Artist if possible

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      if (!user) return;
      // Get or create artist for this user
      const a = await getOrCreateArtistByClerkId(
        user.id,
        user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || "",
        user.fullName || user.username || "Artist"
      );
      setArtist(a);
      const c = await getCampaignsByArtist(a.id);
      setCampaigns(c);
      const f = await getFansByArtist(a.id);
      setFans(f);
      const emails: Record<string, any[]> = {};
      for (const campaign of c) {
        emails[campaign.id] = await getEmailsSentByCampaign(campaign.id);
      }
      setEmailsSent(emails);
      setLoading(false);
    }
    if (isLoaded) fetchData();
  }, [user, isLoaded]);

  if (loading || !artist) return <div>Loading analytics...</div>;

  return (
    <section className="mb-8">
      <h2 className="text-lg font-medium mb-2">Campaign Analytics</h2>
      <Table className="w-full text-sm border mb-8">
        <TableHeader>
          <TableRow>
            <TableHead className="border px-2 py-1 text-left">Campaign</TableHead>
            <TableHead className="border px-2 py-1 text-left">Sent</TableHead>
            <TableHead className="border px-2 py-1 text-left">Opens</TableHead>
            <TableHead className="border px-2 py-1 text-left">Clicks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map(c => {
            const sent = emailsSent[c.id]?.length || 0;
            const opens = emailsSent[c.id]?.filter(e => e.open_status).length || 0;
            const clicks = emailsSent[c.id]?.filter(e => e.click_status).length || 0;
            return (
              <TableRow key={c.id}>
                <TableCell className="border px-2 py-1">{c.title}</TableCell>
                <TableCell className="border px-2 py-1">{sent}</TableCell>
                <TableCell className="border px-2 py-1">{opens} ({sent ? Math.round((opens/sent)*100) : 0}%)</TableCell>
                <TableCell className="border px-2 py-1">{clicks} ({sent ? Math.round((clicks/sent)*100) : 0}%)</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <h3 className="text-base font-medium mb-2">Fan Engagement</h3>
      <Table className="w-full text-sm border">
        <TableHeader>
          <TableRow>
            <TableHead className="border px-2 py-1 text-left">Fan Email</TableHead>
            <TableHead className="border px-2 py-1 text-left">Opens</TableHead>
            <TableHead className="border px-2 py-1 text-left">Clicks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fans.map(fan => {
            let opens = 0, clicks = 0;
            for (const c of campaigns) {
              const e = emailsSent[c.id]?.find(e => e.fan_id === fan.id);
              if (e) {
                if (e.open_status) opens++;
                if (e.click_status) clicks++;
              }
            }
            return (
              <TableRow key={fan.id}>
                <TableCell className="border px-2 py-1">{fan.email}</TableCell>
                <TableCell className="border px-2 py-1">{opens}</TableCell>
                <TableCell className="border px-2 py-1">{clicks}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
} 