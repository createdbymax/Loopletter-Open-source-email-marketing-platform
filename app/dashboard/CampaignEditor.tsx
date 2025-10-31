"use client";
import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
export function CampaignEditor({ value, onChange, }: {
    value: string;
    onChange: (val: string) => void;
}) {
    return (<div className="space-y-2">
      <Textarea name="content" value={value} onChange={e => onChange(e.target.value)} placeholder="Write your email content here... (Markdown supported)" rows={10}/>
      <div className="border rounded p-2 bg-muted text-muted-foreground">
        <div className="text-xs mb-1">Live Preview:</div>
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{value}</div>
      </div>
    </div>);
}
