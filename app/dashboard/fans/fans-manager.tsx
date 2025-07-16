"use client";

import { useUser } from "@clerk/nextjs";
import { getFansByArtist, getOrCreateArtistByClerkId, addFan } from "@/lib/db";
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
import { useEffect, useState } from "react";
import { Plus, Users, Mail, Download, Upload } from "lucide-react";
import { Fan, Artist } from "@/lib/types";

export function FansManager() {
  const { user, isLoaded } = useUser();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [fans, setFans] = useState<Fan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFan, setNewFan] = useState({ email: '', name: '' });

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);
      try {
        const a = await getOrCreateArtistByClerkId(
          user.id,
          user.primaryEmailAddress?.emailAddress || '',
          user.fullName || user.username || "Artist"
        );
        setArtist(a);
        const fansData = await getFansByArtist(a.id);
        setFans(fansData);
      } catch (error) {
        console.error('Error fetching fans:', error);
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
      const fan = await addFan({
        email: newFan.email,
        name: newFan.name || null,
        artist_id: artist.id,
        tags: null,
      });
      setFans([...fans, fan]);
      setNewFan({ email: '', name: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding fan:', error);
      alert('Failed to add fan');
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
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Fan
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="ml-2 text-sm font-medium text-gray-900">Total Fans</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{fans.length}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-green-600" />
            <h3 className="ml-2 text-sm font-medium text-gray-900">Active Subscribers</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{fans.length}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <Plus className="w-5 h-5 text-purple-600" />
            <h3 className="ml-2 text-sm font-medium text-gray-900">This Month</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {fans.filter(f => {
              if (!f.created_at) return false;
              const fanDate = new Date(f.created_at);
              const now = new Date();
              return (
                fanDate.getMonth() === now.getMonth() &&
                fanDate.getFullYear() === now.getFullYear()
              );
            }).length}
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
                  onChange={(e) => setNewFan(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="fan@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newFan.name}
                  onChange={(e) => setNewFan(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Fan Name"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Add Fan</Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No fans yet</h3>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {fans.map((fan) => (
                <TableRow key={fan.id}>
                  <TableCell className="font-medium">{fan.email}</TableCell>
                  <TableCell>{fan.name || '-'}</TableCell>
                  <TableCell>
                    {fan.tags?.length ? fan.tags.join(', ') : '-'}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}