"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { 
  getOrCreateArtistByClerkId, 
  getTeamMembersByArtist, 
  inviteTeamMember 
} from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
  Plus, 
  Users, 
  Crown, 
  Shield, 
  Edit, 
  Eye, 
  MoreHorizontal,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Settings
} from "lucide-react";
import type { TeamMember } from "@/lib/types";

const ROLES = [
  { 
    value: 'owner', 
    label: 'Owner', 
    icon: Crown,
    description: 'Full access to everything',
    permissions: ['all']
  },
  { 
    value: 'admin', 
    label: 'Admin', 
    icon: Shield,
    description: 'Manage campaigns, fans, and settings',
    permissions: ['campaigns', 'fans', 'analytics', 'templates', 'settings']
  },
  { 
    value: 'editor', 
    label: 'Editor', 
    icon: Edit,
    description: 'Create and edit campaigns',
    permissions: ['campaigns', 'templates', 'analytics']
  },
  { 
    value: 'viewer', 
    label: 'Viewer', 
    icon: Eye,
    description: 'View-only access to campaigns and analytics',
    permissions: ['analytics']
  },
];

function InviteMemberDialog({ 
  onInvite, 
  onCancel 
}: { 
  onInvite: (data: any) => void; 
  onCancel: () => void; 
}) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<TeamMember['role']>('editor');

  const handleInvite = () => {
    if (!email.trim() || !name.trim()) return;
    
    const roleInfo = ROLES.find(r => r.value === role);
    onInvite({
      email: email.trim(),
      name: name.trim(),
      role,
      permissions: roleInfo?.permissions || [],
      status: 'pending',
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@example.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Full Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Role</label>
          <Select value={role} onValueChange={(value: any) => setRole(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.filter(r => r.value !== 'owner').map(role => {
                const RoleIcon = role.icon;
                return (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex items-center gap-2">
                      <RoleIcon className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{role.label}</div>
                        <div className="text-sm text-gray-600">{role.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Permissions for {ROLES.find(r => r.value === role)?.label}</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {ROLES.find(r => r.value === role)?.permissions.map(permission => (
              <div key={permission} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="capitalize">{permission.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleInvite} disabled={!email.trim() || !name.trim()}>
          Send Invitation
        </Button>
      </div>
    </div>
  );
}

export function TeamManager() {
  const { user, isLoaded } = useUser();
  const [artist, setArtist] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

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
        
        const membersData = await getTeamMembersByArtist(a.id);
        setTeamMembers(membersData);
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setLoading(false);
      }
    }
    if (isLoaded) fetchData();
  }, [user, isLoaded]);

  const handleInviteMember = async (data: any) => {
    if (!artist) return;
    try {
      const newMember = await inviteTeamMember({
        ...data,
        artist_id: artist.id,
      });
      setTeamMembers([newMember, ...teamMembers]);
      setShowInviteDialog(false);
      
      // In a real app, you'd send an email invitation here
      alert(`Invitation sent to ${data.email}`);
    } catch (error) {
      console.error('Error inviting team member:', error);
      alert('Failed to send invitation');
    }
  };

  const getRoleInfo = (role: TeamMember['role']) => {
    return ROLES.find(r => r.value === role) || ROLES[3];
  };

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: TeamMember['status']) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'pending': return Clock;
      case 'suspended': return XCircle;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Team Management</h1>
          <p className="text-gray-600">Manage team members and their permissions</p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length + 1}</div>
            <p className="text-xs text-muted-foreground">Including you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.filter(m => m.status === 'active').length + 1}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.filter(m => m.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.filter(m => m.role === 'admin').length + 1}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Current user (owner) */}
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">
                        {user?.fullName || user?.firstName || 'You'}
                        <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {user?.primaryEmailAddress?.emailAddress}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <Badge className="bg-yellow-100 text-yellow-800">Owner</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">-</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">Now</span>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" disabled>
                    <Settings className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>

              {/* Team members */}
              {teamMembers.map((member) => {
                const roleInfo = getRoleInfo(member.role);
                const RoleIcon = roleInfo.icon;
                const StatusIcon = getStatusIcon(member.status);
                
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-gray-600">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <RoleIcon className="w-4 h-4 text-gray-600" />
                        <Badge variant="outline">{roleInfo.label}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusIcon className="w-4 h-4" />
                        <Badge className={getStatusColor(member.status)}>
                          {member.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {member.joined_at 
                          ? new Date(member.joined_at).toLocaleDateString()
                          : 'Pending'
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {member.status === 'active' ? '2 days ago' : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Role
                          </DropdownMenuItem>
                          {member.status === 'pending' && (
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 mr-2" />
                              Resend Invite
                            </DropdownMenuItem>
                          )}
                          {member.status === 'active' && (
                            <DropdownMenuItem>
                              <XCircle className="w-4 h-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600">
                            <XCircle className="w-4 h-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {teamMembers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
              <p className="text-gray-600 mb-6">
                Invite team members to collaborate on your email campaigns
              </p>
              <Button onClick={() => setShowInviteDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Invite Your First Team Member
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Permissions Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLES.map((role) => {
              const RoleIcon = role.icon;
              return (
                <div key={role.value} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <RoleIcon className="w-5 h-5" />
                    <h4 className="font-medium">{role.label}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                  <div className="space-y-1">
                    {role.permissions.map(permission => (
                      <div key={permission} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="capitalize">{permission.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Invite Member Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <InviteMemberDialog
            onInvite={handleInviteMember}
            onCancel={() => setShowInviteDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}