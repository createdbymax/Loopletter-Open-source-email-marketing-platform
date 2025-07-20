"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Zap, 
  Plus, 
  Trash2, 
  Edit, 
  Mail, 
  Tag, 
  Clock, 
  Calendar,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { Artist, Automation } from '@/lib/types';
import { FeatureGate } from '@/components/ui/feature-access';

interface AutomationManagerProps {
  artist: Artist;
}

export function AutomationManager({ artist }: AutomationManagerProps) {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAutomations() {
      try {
        setLoading(true);
        const response = await fetch('/api/automations');
        
        if (!response.ok) {
          if (response.status === 403) {
            // Feature access denied
            setAutomations([]);
            setLoading(false);
            return;
          }
          throw new Error('Failed to fetch automations');
        }
        
        const data = await response.json();
        setAutomations(data);
      } catch (error) {
        console.error('Error fetching automations:', error);
        setError('Could not load automations');
      } finally {
        setLoading(false);
      }
    }
    
    fetchAutomations();
  }, []);

  const toggleAutomationStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      
      const response = await fetch(`/api/automations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update automation status');
      }
      
      setAutomations(automations.map(automation => 
        automation.id === id ? { ...automation, status: newStatus as string } : automation
      ));
    } catch (error) {
      console.error('Error updating automation status:', error);
      setError('Failed to update automation status');
    }
  };

  const getTriggerDescription = (trigger: Record<string, unknown>) => {
    switch (trigger.type) {
      case 'fan_subscribed':
        return 'When a fan subscribes';
      case 'fan_tagged':
        return `When a fan is tagged with "${trigger.conditions.tag}"`;
      case 'campaign_opened':
        return `When a fan opens "${trigger.conditions.campaign_name}"`;
      case 'campaign_clicked':
        return `When a fan clicks a link in "${trigger.conditions.campaign_name}"`;
      case 'date_based':
        return `On ${trigger.conditions.date}`;
      case 'custom_field_changed':
        return `When "${trigger.conditions.field}" changes`;
      default:
        return 'Custom trigger';
    }
  };

  const getActionDescription = (action: Record<string, unknown>) => {
    switch (action.type) {
      case 'send_email':
        return `Send email "${action.config.subject}"`;
      case 'add_tag':
        return `Add tag "${action.config.tag}"`;
      case 'remove_tag':
        return `Remove tag "${action.config.tag}"`;
      case 'update_field':
        return `Update field "${action.config.field}"`;
      case 'webhook':
        return `Call webhook`;
      case 'wait':
        return `Wait ${action.config.duration} ${action.config.unit}`;
      default:
        return 'Custom action';
    }
  };

  const getActionIcon = (action: Record<string, unknown>) => {
    switch (action.type) {
      case 'send_email':
        return <Mail className="h-4 w-4" />;
      case 'add_tag':
      case 'remove_tag':
        return <Tag className="h-4 w-4" />;
      case 'update_field':
        return <Edit className="h-4 w-4" />;
      case 'webhook':
        return <Zap className="h-4 w-4" />;
      case 'wait':
        return <Clock className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <FeatureGate
      feature="automations"
      artist={artist}
      fallback={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Automations</h1>
              <p className="text-gray-600 mt-2">
                Create automated workflows triggered by subscriber actions
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Automations
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Zap className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">Unlock Automations</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Automations allow you to create powerful workflows that respond to subscriber actions automatically.
                Upgrade to the Independent plan to access this feature.
              </p>
              <Button>Upgrade to Independent Plan</Button>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Automations</h1>
            <p className="text-gray-600 mt-2">
              Create automated workflows triggered by subscriber actions
            </p>
          </div>
          
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Automation
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        ) : automations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Zap className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">No Automations Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Create your first automation to engage with your subscribers automatically based on their actions.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Automation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Automations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Actions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead className="w-24">Manage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {automations.map((automation) => (
                    <TableRow key={automation.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-blue-600" />
                          {automation.name}
                        </div>
                        {automation.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {automation.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{getTriggerDescription(automation.trigger)}</span>
                        </div>
                        {automation.trigger.delay && (
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              After {automation.trigger.delay.amount} {automation.trigger.delay.unit}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {automation.actions.map((action, i) => (
                            <div key={i} className="flex items-center gap-1 text-sm">
                              <div className="flex items-center gap-1">
                                {getActionIcon(action)}
                                <span>{getActionDescription(action)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={automation.status === 'active'}
                            onCheckedChange={() => toggleAutomationStatus(automation.id, automation.status)}
                          />
                          <Badge variant={automation.status === 'active' ? 'default' : 'outline'}>
                            {automation.status === 'active' ? 'Active' : 'Paused'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="font-medium">{automation.stats.triggered}</span> triggered
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">{automation.stats.completed}</span> completed
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">{automation.stats.conversion_rate}%</span> conversion
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
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
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Automation Limits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Your current plan includes unlimited automations. Create as many automated workflows as you need to engage with your audience.
            </p>
          </CardContent>
        </Card>
      </div>
    </FeatureGate>
  );
}