"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Trash2,
  Mail,
  Lock,
  UserPlus,
  Shield,
} from "lucide-react";
import { Artist, TeamMember } from "@/lib/types";
import { FeatureGate } from "@/components/ui/feature-access";

interface TeamManagerProps {
  artist: Artist;
}

export function TeamManager({ artist }: TeamManagerProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  // New team member form state
  const [newMember, setNewMember] = useState({
    email: "",
    name: "",
    role: "editor" as "owner" | "admin" | "editor" | "viewer",
    permissions: [] as string[],
  });

  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        setLoading(true);
        const response = await fetch("/api/team");

        if (!response.ok) {
          if (response.status === 403) {
            // Feature access denied
            setTeamMembers([]);
            setLoading(false);
            return;
          }
          throw new Error("Failed to fetch team members");
        }

        const data = await response.json();
        setTeamMembers(data);
      } catch (error) {
        console.error("Error fetching team members:", error);
        setError("Could not load team members");
      } finally {
        setLoading(false);
      }
    }

    fetchTeamMembers();
  }, []);

  const handleInviteMember = async () => {
    try {
      setIsInviting(true);

      const response = await fetch("/api/team/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMember),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to invite team member");
      }

      const invitedMember = await response.json();
      setTeamMembers([...teamMembers, invitedMember]);

      // Reset form
      setNewMember({
        email: "",
        name: "",
        role: "editor",
        permissions: [],
      });
    } catch (error: unknown) {
      console.error("Error inviting team member:", error);
      setError(error.message || "Failed to invite team member");
    } finally {
      setIsInviting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            Owner
          </Badge>
        );
      case "admin":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Admin
          </Badge>
        );
      case "editor":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Editor
          </Badge>
        );
      case "viewer":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Viewer
          </Badge>
        );
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Active
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pending
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Suspended
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <FeatureGate
      feature="multiUserAccess"
      artist={artist}
      fallback={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team</h1>
              <p className="text-gray-600 mt-2">
                Invite team members to collaborate on your email campaigns
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Team Management
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">
                Unlock Team Collaboration
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Team management allows you to invite team members with different
                permission levels to collaborate on your email campaigns. This
                feature is available on the Label/Agency plan.
              </p>
              <Button>Upgrade to Label/Agency Plan</Button>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team</h1>
            <p className="text-gray-600 mt-2">
              Invite team members to collaborate on your email campaigns
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Team Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="member-email">Email Address</Label>
                  <Input
                    id="member-email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) =>
                      setNewMember({ ...newMember, email: e.target.value })
                    }
                    placeholder="colleague@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="member-name">Name (Optional)</Label>
                  <Input
                    id="member-name"
                    value={newMember.name}
                    onChange={(e) =>
                      setNewMember({ ...newMember, name: e.target.value })
                    }
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="member-role">Role</Label>
                  <Select
                    value={newMember.role}
                    onValueChange={(value) =>
                      setNewMember({
                        ...newMember,
                        role: value as "owner" | "admin" | "editor" | "viewer",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="text-xs text-gray-500 mt-1">
                    <p>
                      <strong>Admin:</strong> Can manage all aspects except
                      billing
                    </p>
                    <p>
                      <strong>Editor:</strong> Can create and edit campaigns,
                      but can't manage team or settings
                    </p>
                    <p>
                      <strong>Viewer:</strong> Can view campaigns and analytics,
                      but can't make changes
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={handleInviteMember}
                  disabled={isInviting || !newMember.email}
                >
                  {isInviting ? "Sending Invitation..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        ) : teamMembers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">No Team Members Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Invite team members to collaborate on your email campaigns. You
                can assign different roles and permissions.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Your First Team Member
                  </Button>
                </DialogTrigger>
                {/* Dialog content is the same as above */}
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.name || "Not provided"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          {member.email}
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(member.role)}</TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell>
                        {member.joined_at
                          ? new Date(member.joined_at).toLocaleDateString()
                          : "Not joined yet"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Team Limits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Your Label/Agency plan includes up to 5 team members. You are
              currently using {teamMembers.length} of 5 seats.
            </p>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${(teamMembers.length / 5) * 100}%` }}
              ></div>
            </div>
            <div className="mt-2 flex justify-between text-sm text-gray-500">
              <span>{teamMembers.length} used</span>
              <span>{5 - teamMembers.length} remaining</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </FeatureGate>
  );
}
