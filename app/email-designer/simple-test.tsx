"use client";
import React, { useState, useEffect } from "react";
import { Editor } from "@maily-to/core";
export default function SimpleTest() {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);
    if (!isClient) {
        return <div>Loading...</div>;
    }
    return (<div style={{ height: "500px", padding: "20px" }}>
      <h1>Simple Maily.to Test</h1>
      <div style={{ height: "400px", border: "1px solid #ccc", marginTop: "20px" }}>
        <Editor contentHtml="<h1>Test Content</h1><p>This is a simple test of the Maily.to editor.</p>" config={{
            immediatelyRender: false,
        }}/>
      </div>
    </div>);
}
