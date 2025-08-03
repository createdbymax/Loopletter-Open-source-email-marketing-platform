"use client";

import { useUser } from "@clerk/nextjs";
import { getFansByArtist, getOrCreateArtistByClerkId } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import {
  Plus,
  Users,
  Mail,
  Download,
  Upload,
  MoreHorizontal,
  UserMinus,
  Trash2,
  UserCheck,
} from "lucide-react";
import { Fan, Artist } from "@/lib/types";
import { SubscriberLimitWarning } from "@/components/ui/limit-warning";
import { hasReachedSubscriberLimit } from "@/lib/subscription";

export function FansManager() {
  const { user, isLoaded } = useUser();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [fans, setFans] = useState<Fan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFan, setNewFan] = useState({ email: "", name: "" });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    fan: Fan | null;
  }>({ open: false, fan: null });

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);
      try {
        const a = await getOrCreateArtistByClerkId(
          user.id,
          user.primaryEmailAddress?.emailAddress || "",
          user.fullName || user.username || "Artist"
        );
        setArtist(a);
        const fansData = await getFansByArtist(a.id);
        setFans(fansData);
      } catch (error) {
        console.error("Error fetching fans:", error);
      } finally {
        setLoading(false);
      }
    }
    if (isLoaded) fetchData();
  }, [user, isLoaded]);

  const handleAddFan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artist || !newFan.email) return;

    try {
      const response = await fetch("/api/fans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newFan.email,
          name: newFan.name || null,
          source: "manual",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add fan");
      }

      if (data.fans && data.fans.length > 0) {
        setFans([...fans, ...data.fans]);
      }

      setNewFan({ email: "", name: "" });
      setShowAddForm(false);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        alert(error.message);
      } else {
        console.error("Unknown error", error);
        alert("Failed to add fan");
      }
    }
  };

  const handleFanAction = async (
    fanId: string,
    action: "unsubscribe" | "resubscribe"
  ) => {
    setActionLoading(fanId);
    try {
      const response = await fetch(`/api/fans/${fanId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} fan`);
      }

      // Update the fan in the local state
      setFans((prevFans) =>
        prevFans.map((fan) =>
          fan.id === fanId
            ? {
                ...fan,
                status: data.fan.status,
                unsubscribed_at: data.fan.unsubscribed_at,
              }
            : fan
        )
      );
    } catch (error) {
      console.error(`Error ${action}ing fan:`, error);
      alert(error instanceof Error ? error.message : `Failed to ${action} fan`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteFan = async (fan: Fan) => {
    setActionLoading(fan.id);
    try {
      const response = await fetch(`/api/fans/${fan.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete fan");
      }

      // Remove the fan from the local state
      setFans((prevFans) => prevFans.filter((f) => f.id !== fan.id));
      setDeleteDialog({ open: false, fan: null });
    } catch (error) {
      console.error("Error deleting fan:", error);
      alert(error instanceof Error ? error.message : "Failed to delete fan");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading fans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Fans</h1>
          <p className="text-gray-600">Manage your email subscribers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/dashboard/fans/import">
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </a>
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => setShowAddForm(true)}
            disabled={
              artist
                ? hasReachedSubscriberLimit(artist, fans.length)
                : undefined
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Fan
          </Button>
        </div>
      </div>

      {/* Subscriber Limit Warning */}
      {artist && (
        <SubscriberLimitWarning artist={artist} currentCount={fans.length} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="ml-2 text-sm font-medium text-gray-900">
              Total Fans
            </h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{fans.length}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-green-600" />
            <h3 className="ml-2 text-sm font-medium text-gray-900">
              Active Subscribers
            </h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {fans.filter((f) => f.status === "subscribed").length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <Plus className="w-5 h-5 text-purple-600" />
            <h3 className="ml-2 text-sm font-medium text-gray-900">
              This Month
            </h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {
              fans.filter((f) => {
                if (!f.created_at) return false;
                const fanDate = new Date(f.created_at);
                const now = new Date();
                return (
                  fanDate.getMonth() === now.getMonth() &&
                  fanDate.getFullYear() === now.getFullYear()
                );
              }).length
            }
          </p>
        </div>
      </div>

      {/* Add Fan Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium mb-4">Add New Fan</h3>
          <form onSubmit={handleAddFan} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newFan.email}
                  onChange={(e) =>
                    setNewFan((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="fan@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newFan.name}
                  onChange={(e) =>
                    setNewFan((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Fan Name"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Add Fan</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Fans Table */}
      <div className="bg-white rounded-lg border">
        {fans.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No fans yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start building your audience by adding your first fan
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Fan
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fans.map((fan) => (
                <TableRow key={fan.id}>
                  <TableCell className="font-medium">{fan.email}</TableCell>
                  <TableCell>{fan.name || "-"}</TableCell>
                  <TableCell>
                    {fan.tags?.length ? fan.tags.join(", ") : "-"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        fan.status === "subscribed"
                          ? "bg-green-100 text-green-800"
                          : fan.status === "unsubscribed"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {fan.status === "subscribed"
                        ? "Active"
                        : fan.status === "unsubscribed"
                          ? "Unsubscribed"
                          : fan.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          disabled={actionLoading === fan.id}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {fan.status === "subscribed" ? (
                          <DropdownMenuItem
                            onClick={() =>
                              handleFanAction(fan.id, "unsubscribe")
                            }
                            disabled={actionLoading === fan.id}
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            Unsubscribe
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() =>
                              handleFanAction(fan.id, "resubscribe")
                            }
                            disabled={actionLoading === fan.id}
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Resubscribe
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => setDeleteDialog({ open: true, fan })}
                          disabled={actionLoading === fan.id}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, fan: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteDialog.fan?.email}? This
              action cannot be undone and will permanently remove the fan from
              your audience.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteDialog.fan && handleDeleteFan(deleteDialog.fan)
              }
              className="bg-red-600 hover:bg-red-700"
              disabled={actionLoading === deleteDialog.fan?.id}
            >
              {actionLoading === deleteDialog.fan?.id
                ? "Deleting..."
                : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
