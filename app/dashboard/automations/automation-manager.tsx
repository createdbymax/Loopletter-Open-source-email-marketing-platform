"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { 
  getOrCreateArtistByClerkId, 
  getAutomationsByArtist, 
  createAutomation, 
  updateAutomation 
} from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Zap, 
  Play, 
  Pause, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Clock,
  Mail,
  Users,
  Target,
  ArrowRight,
  Settings
} from "lucide-react";
import type { Automation, AutomationTrigger, AutomationAction } from "@/lib/types";

const TRIGGER_TYPES = [
  { value: 'fan_subscribed', label: 'Fan Subscribes', description: 'When someone joins your list' },
  { value: 'fan_tagged', label: 'Fan Tagged', description: 'When a fan gets a specific tag' },
  { value: 'campaign_opened', label: 'Campaign Opened', description: 'When someone opens an email' },
  { value: 'campaign_clicked', label: 'Campaign Clicked', description: 'When someone clicks a link' },
  { value: 'date_based', label: 'Date Based', description: 'On a specific date or interval' },
  { value: 'custom_field_changed', label: 'Field Changed', description: 'When a custom field updates' },
];

const ACTION_TYPES = [
  { value: 'send_email', label: 'Send Email', description: 'Send a campaign or template' },
  { value: 'add_tag', label: 'Add Tag', description: 'Add a tag to the fan' },
  { value: 'remove_tag', label: 'Remove Tag', description: 'Remove a tag from the fan' },
  { value: 'update_field', label: 'Update Field', description: 'Change a custom field value' },
  { value: 'webhook', label: 'Webhook', description: 'Send data to external service' },
  { value: 'wait', label: 'Wait', description: 'Pause before next action' },
];

const TIME_UNITS = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
];

function AutomationBuilder({ 
  automation, 
  onSave, 
  onCancel 
}: { 
  automation?: Automation; 
  onSave: (data: any) => void; 
  onCancel: () => void; 
}) {
  const [name, setName] = useState(automation?.name || '');
  const [description, setDescription] = useState(automation?.description || '');
  const [trigger, setTrigger] = useState<AutomationTrigger>(
    automation?.trigger || { type: 'fan_subscribed', conditions: {} }
  );
  const [actions, setActions] = useState<AutomationAction[]>(
    automation?.actions || [{ type: 'send_email', config: {} }]
  );

  const updateTrigger = (updates: Partial<AutomationTrigger>) => {
    setTrigger({ ...trigger, ...updates });
  };

  const addAction = () => {
    setActions([...actions, { type: 'send_email', config: {} }]);
  };

  const updateAction = (index: number, updates: Partial<AutomationAction>) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], ...updates };
    setActions(newActions);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      trigger,
      actions: actions.filter(a => a.type),
      status: 'draft',
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Automation Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Welcome Series"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Description (Optional)</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this automation..."
            rows={2}
          />
        </div>
      </div>

      {/* Trigger Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Trigger
        </h3>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">When this happens:</label>
                <Select
                  value={trigger.type}
                  onValueChange={(value) => updateTrigger({ type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-gray-600">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Trigger-specific configuration */}
              {trigger.type === 'fan_tagged' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Tag:</label>
                  <Input
                    value={trigger.conditions.tag || ''}
                    onChange={(e) => updateTrigger({ 
                      conditions: { ...trigger.conditions, tag: e.target.value } 
                    })}
                    placeholder="Enter tag name"
                  />
                </div>
              )}

              {trigger.type === 'date_based' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date:</label>
                    <Input
                      type="date"
                      value={trigger.conditions.date || ''}
                      onChange={(e) => updateTrigger({ 
                        conditions: { ...trigger.conditions, date: e.target.value } 
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Time:</label>
                    <Input
                      type="time"
                      value={trigger.conditions.time || ''}
                      onChange={(e) => updateTrigger({ 
                        conditions: { ...trigger.conditions, time: e.target.value } 
                      })}
                    />
                  </div>
                </div>
              )}

              {/* Delay configuration */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Delay (Optional):</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={trigger.delay?.amount || ''}
                      onChange={(e) => updateTrigger({ 
                        delay: { 
                          ...trigger.delay, 
                          amount: parseInt(e.target.value) || 0,
                          unit: trigger.delay?.unit || 'minutes'
                        } 
                      })}
                      placeholder="0"
                      className="w-20"
                    />
                    <Select
                      value={trigger.delay?.unit || 'minutes'}
                      onValueChange={(value) => updateTrigger({ 
                        delay: { 
                          ...trigger.delay, 
                          amount: trigger.delay?.amount || 0,
                          unit: value as any
                        } 
                      })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_UNITS.map(unit => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Target className="w-5 h-5" />
            Actions
          </h3>
          <Button variant="outline" size="sm" onClick={addAction}>
            <Plus className="w-4 h-4 mr-2" />
            Add Action
          </Button>
        </div>

        <div className="space-y-3">
          {actions.map((action, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium">Action {index + 1}</span>
                    </div>
                    {actions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAction(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Action Type:</label>
                    <Select
                      value={action.type}
                      onValueChange={(value) => updateAction(index, { type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTION_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-gray-600">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Action-specific configuration */}
                  {action.type === 'send_email' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Template:</label>
                      <Input
                        value={action.config.template_id || ''}
                        onChange={(e) => updateAction(index, { 
                          config: { ...action.config, template_id: e.target.value } 
                        })}
                        placeholder="Template ID or subject line"
                      />
                    </div>
                  )}

                  {(action.type === 'add_tag' || action.type === 'remove_tag') && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Tag:</label>
                      <Input
                        value={action.config.tag || ''}
                        onChange={(e) => updateAction(index, { 
                          config: { ...action.config, tag: e.target.value } 
                        })}
                        placeholder="Enter tag name"
                      />
                    </div>
                  )}

                  {action.type === 'webhook' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Webhook URL:</label>
                      <Input
                        value={action.config.url || ''}
                        onChange={(e) => updateAction(index, { 
                          config: { ...action.config, url: e.target.value } 
                        })}
                        placeholder="https://your-webhook-url.com"
                      />
                    </div>
                  )}

                  {action.type === 'wait' && (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={action.delay?.amount || ''}
                        onChange={(e) => updateAction(index, { 
                          delay: { 
                            ...action.delay, 
                            amount: parseInt(e.target.value) || 0,
                            unit: action.delay?.unit || 'hours'
                          } 
                        })}
                        placeholder="1"
                        className="w-20"
                      />
                      <Select
                        value={action.delay?.unit || 'hours'}
                        onValueChange={(value) => updateAction(index, { 
                          delay: { 
                            ...action.delay, 
                            amount: action.delay?.amount || 1,
                            unit: value as any
                          } 
                        })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_UNITS.map(unit => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!name.trim()}>
          {automation ? 'Update' : 'Create'} Automation
        </Button>
      </div>
    </div>
  );
}

export function AutomationManager() {
  const { user, isLoaded } = useUser();
  const [artist, setArtist] = useState<any>(null);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);

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
        
        const automationsData = await getAutomationsByArtist(a.id);
        setAutomations(automationsData);
      } catch (error) {
        console.error('Error fetching automations:', error);
      } finally {
        setLoading(false);
      }
    }
    if (isLoaded) fetchData();
  }, [user, isLoaded]);

  const handleCreateAutomation = async (data: any) => {
    if (!artist) return;
    try {
      const newAutomation = await createAutomation({
        ...data,
        artist_id: artist.id,
      });
      setAutomations([newAutomation, ...automations]);
      setShowBuilder(false);
    } catch (error) {
      console.error('Error creating automation:', error);
      alert('Failed to create automation');
    }
  };

  const handleUpdateAutomation = async (data: any) => {
    if (!editingAutomation) return;
    try {
      const updatedAutomation = await updateAutomation(editingAutomation.id, data);
      setAutomations(automations.map(a => a.id === editingAutomation.id ? updatedAutomation : a));
      setEditingAutomation(null);
    } catch (error) {
      console.error('Error updating automation:', error);
      alert('Failed to update automation');
    }
  };

  const toggleAutomationStatus = async (automation: Automation) => {
    const newStatus = automation.status === 'active' ? 'paused' : 'active';
    try {
      const updated = await updateAutomation(automation.id, { status: newStatus });
      setAutomations(automations.map(a => a.id === automation.id ? updated : a));
    } catch (error) {
      console.error('Error updating automation status:', error);
      alert('Failed to update automation status');
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
          <h1 className="text-2xl font-semibold">Email Automations</h1>
          <p className="text-gray-600">Set up automated email workflows</p>
        </div>
        <Button onClick={() => setShowBuilder(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Automation
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Automations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{automations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {automations.filter(a => a.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Triggered</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {automations.reduce((sum, a) => sum + a.stats.triggered, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Conversion</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {automations.length > 0 
                ? (automations.reduce((sum, a) => sum + a.stats.conversion_rate, 0) / automations.length).toFixed(1)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Automations</CardTitle>
        </CardHeader>
        <CardContent>
          {automations.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No automations yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first automation to engage subscribers automatically
              </p>
              <Button onClick={() => setShowBuilder(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Automation
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {automations.map((automation) => (
                  <TableRow key={automation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{automation.name}</div>
                        {automation.description && (
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {automation.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {TRIGGER_TYPES.find(t => t.value === automation.trigger.type)?.label || automation.trigger.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{automation.actions.length}</span>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <div className="flex gap-1">
                          {automation.actions.slice(0, 2).map((action, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {ACTION_TYPES.find(t => t.value === action.type)?.label || action.type}
                            </Badge>
                          ))}
                          {automation.actions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{automation.actions.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={automation.status === 'active'}
                          onCheckedChange={() => toggleAutomationStatus(automation)}
                        />
                        <Badge 
                          variant={automation.status === 'active' ? 'default' : 'secondary'}
                          className={automation.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {automation.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{automation.stats.triggered} triggered</div>
                        <div className="text-gray-600">
                          {automation.stats.conversion_rate.toFixed(1)}% conversion
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {new Date(automation.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingAutomation(automation)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleAutomationStatus(automation)}>
                            {automation.status === 'active' ? (
                              <>
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Automation Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Automation</DialogTitle>
          </DialogHeader>
          <AutomationBuilder
            onSave={handleCreateAutomation}
            onCancel={() => setShowBuilder(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Automation Dialog */}
      <Dialog open={!!editingAutomation} onOpenChange={() => setEditingAutomation(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Automation</DialogTitle>
          </DialogHeader>
          {editingAutomation && (
            <AutomationBuilder
              automation={editingAutomation}
              onSave={handleUpdateAutomation}
              onCancel={() => setEditingAutomation(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}