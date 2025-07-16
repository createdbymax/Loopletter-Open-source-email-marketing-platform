"use client";
import * as React from "react";
import { addFan, getArtistBySlug } from "@/lib/db";

export default function FanSignupPage({
  params,
}: {
  params: Promise<{ "artist-slug": string }>;
}) {
  const [slug, setSlug] = React.useState<string>("");

  React.useEffect(() => {
    params.then((p) => setSlug(p["artist-slug"]));
  }, [params]);
  const [artist, setArtist] = React.useState<{
    name: string;
    id: string;
  } | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (slug) {
      getArtistBySlug(slug)
        .then((a) => {
          setArtist(a);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [slug]);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    await addFan({
      email,
      artist_id: artist!.id,
      name,
      tags: [],
      status: "subscribed",
      source: "signup_page",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setSubmitted(true);
  }

  if (loading)
    return <main className="max-w-md mx-auto py-16">Loading...</main>;
  if (!artist)
    return <main className="max-w-md mx-auto py-16">Artist not found.</main>;

  return (
    <main className="max-w-md mx-auto py-16">
      <h1 className="text-2xl font-semibold mb-4">
        Subscribe to {artist.name}
      </h1>
      {submitted ? (
        <div className="text-lg">Thank you for subscribing!</div>
      ) : (
        <form onSubmit={handleSignup} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              name="name"
              className="border px-2 py-1 rounded w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              name="email"
              type="email"
              className="border px-2 py-1 rounded w-full"
              required
            />
          </div>
          <button type="submit" className="border rounded px-4 py-2">
            Subscribe
          </button>
        </form>
      )}
    </main>
  );
}
