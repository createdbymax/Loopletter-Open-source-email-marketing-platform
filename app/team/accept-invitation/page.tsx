"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SignIn, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn, user } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<any>(null);
  const [acceptingInvitation, setAcceptingInvitation] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    async function verifyInvitation() {
      if (!token) {
        setError("Invalid invitation link");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/team/verify-invitation?token=${token}`
        );

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || "Invalid or expired invitation");
          setLoading(false);
          return;
        }

        const data = await response.json();
        setInvitation(data);
      } catch (error) {
        console.error("Error verifying invitation:", error);
        setError("Failed to verify invitation");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      verifyInvitation();
    } else {
      setError("Missing invitation token");
      setLoading(false);
    }
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (!isSignedIn || !token) return;

    setAcceptingInvitation(true);
    try {
      const response = await fetch("/api/team/accept-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to accept invitation");
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      setError(error.message || "Failed to accept invitation");
    } finally {
      setAcceptingInvitation(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitation Error</CardTitle>
            <CardDescription>
              There was a problem with your invitation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/")}>Go to Homepage</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Team Invitation</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join {invitation.artistName}&apos;s team
            on Loopletter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              You&apos;ve been invited to collaborate as a{" "}
              <strong>{invitation.role}</strong> on {invitation.artistName}
              &apos;s Loopletter account.
            </p>

            {!isLoaded ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : isSignedIn ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  Signed in as {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Please sign in or create an account to accept this invitation
                </p>
                <div className="border rounded-lg overflow-hidden">
                  <SignIn
                    redirectUrl={`/team/accept-invitation?token=${token}`}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>

        {isSignedIn && (
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/")}>
              Cancel
            </Button>
            <Button
              onClick={handleAcceptInvitation}
              disabled={acceptingInvitation}
            >
              {acceptingInvitation ? "Accepting..." : "Accept Invitation"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AcceptInvitationContent />
    </Suspense>
  );
}
