"use client";
import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { getFansByArtist, updateFan, getOrCreateArtistByClerkId, addFan } from "@/lib/db";
import type { Fan } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function exportCSV(fans: Fan[]) {
  const header = "Email,Name,Tags\n";
  const rows = fans.map(f => `${f.email},${f.name || ''},${f.tags?.join(';') || ''}`).join("\n");
  const csv = header + rows;
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "fans.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text: string) {
  const lines = text.trim().split(/\r?\n/);
  const [header, ...rows] = lines;
  return rows.map(row => {
    const [email, name, tags] = row.split(",");
    return {
      email: email?.trim(),
      name: name?.trim() || null,
      tags: tags ? tags.split(";").map(t => t.trim()).filter(Boolean) : [],
    };
  });
}

export function Fans() {
  const { user, isLoaded } = useUser();
  const [artist, setArtist] = React.useState<any>(null);
  const [fans, setFans] = React.useState<Fan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<Record<string, string>>({});
  const [tagStatus, setTagStatus] = React.useState<Record<string, string>>({});
  const [importing, setImporting] = React.useState(false);
  const [csvPreview, setCsvPreview] = React.useState<any[]>([]);
  const [csvError, setCsvError] = React.useState<string | null>(null);
  const [pasting, setPasting] = React.useState(false);
  const [pasteText, setPasteText] = React.useState("");

  React.useEffect(() => {
    async function fetchArtistAndFans() {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const a = await getOrCreateArtistByClerkId(
          user.id,
          user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || "",
          user.fullName || user.username || "Artist"
        );
        setArtist(a);
        const data = await getFansByArtist(a.id);
        setFans(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    if (isLoaded) fetchArtistAndFans();
  }, [user, isLoaded]);

  async function handleTagChange(fan: Fan, tags: string) {
    setEditing(e => ({ ...e, [fan.id]: tags }));
    try {
      await updateFan(fan.id, { tags: tags.split(',').map(t => t.trim()).filter(Boolean) });
      setFans(fans => fans.map(f => f.id === fan.id ? { ...f, tags: tags.split(',').map(t => t.trim()).filter(Boolean) } : f));
      setTagStatus(s => ({ ...s, [fan.id]: 'Saved' }));
    } catch (e: any) {
      setTagStatus(s => ({ ...s, [fan.id]: 'Error' }));
    }
    setTimeout(() => setTagStatus(s => ({ ...s, [fan.id]: '' })), 2000);
  }

  function handleCSVFile(e: React.ChangeEvent<HTMLInputElement>) {
    setCsvError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSV(text);
        setCsvPreview(parsed);
        setImporting(true);
      } catch (err) {
        setCsvError("Failed to parse CSV");
      }
    };
    reader.readAsText(file);
  }

  function parsePastedContacts(text: string) {
    return text
      .trim()
      .split(/\r?\n/)
      .map(line => {
        const parts = line.split(/,|\t/).map(p => p.trim());
        return {
          email: parts[0],
          name: parts[1] || null,
          tags: parts[2] ? parts[2].split(";").map(t => t.trim()).filter(Boolean) : [],
        };
      })
      .filter(row => row.email);
  }

  async function handleImportConfirm() {
    if (!artist) return;
    let errors = 0;
    for (const row of csvPreview) {
      if (!row.email) { errors++; continue; }
      try {
        await addFan({ ...row, artist_id: artist.id });
      } catch {
        errors++;
      }
    }
    setCsvPreview([]);
    setImporting(false);
    setCsvError(errors ? `${errors} rows failed to import (may be duplicates or invalid)` : null);
    // Refresh fans
    const data = await getFansByArtist(artist.id);
    setFans(data);
  }

  if (!isLoaded || !artist) return <div>Loading...</div>;

  return (
    <section className="mb-8">
      <h2 className="text-lg font-medium mb-2">Fans</h2>
      <div className="flex gap-2 mb-2">
        <Button variant="outline" onClick={() => exportCSV(fans)} disabled={fans.length === 0}>Export CSV</Button>
        <label>
          <Button asChild variant="outline">
            <span>Import CSV</span>
          </Button>
          <Input type="file" accept=".csv" className="hidden" onChange={handleCSVFile} />
        </label>
        <Button variant="outline" onClick={() => { setPasting(true); setPasteText(""); }}>Paste Contacts</Button>
      </div>
      {pasting && (
        <div className="border p-3 mb-2 rounded">
          <div className="mb-2">Paste contacts (one per line, comma/tab separated: email[, name[, tags]]):</div>
          <Textarea
            className="mb-2"
            rows={6}
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder={`alice@email.com\nbob@email.com, Bob\ncarol@email.com, Carol, friend;VIP`}
          />
          <Button
            className="mr-2"
            onClick={() => {
              const parsed = parsePastedContacts(pasteText);
              setCsvPreview(parsed);
              setImporting(true);
              setPasting(false);
            }}
            disabled={!pasteText.trim()}
          >
            Preview
          </Button>
          <Button variant="secondary" onClick={() => setPasting(false)}>Cancel</Button>
        </div>
      )}
      {importing && (
        <div className="border p-3 mb-2 rounded">
          <div className="mb-2">Preview import ({csvPreview.length} contacts):</div>
          <Table className="mb-2">
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvPreview.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.tags?.join(", ")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button className="mr-2" onClick={handleImportConfirm}>Import</Button>
          <Button variant="secondary" onClick={() => { setImporting(false); setCsvPreview([]); }}>Cancel</Button>
        </div>
      )}
      {csvError && <div className="text-red-600 text-sm mb-2">{csvError}</div>}
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {!loading && fans.length === 0 && <div>No fans yet.</div>}
      {!loading && fans.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fans.map(fan => (
              <TableRow key={fan.id}>
                <TableCell>{fan.email}</TableCell>
                <TableCell>{fan.name || "-"}</TableCell>
                <TableCell>
                  <Input
                    value={editing[fan.id] ?? (fan.tags?.join(', ') || '')}
                    onChange={e => handleTagChange(fan, e.target.value)}
                  />
                  {tagStatus[fan.id] && <span className="ml-2 text-xs">{tagStatus[fan.id]}</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
} 