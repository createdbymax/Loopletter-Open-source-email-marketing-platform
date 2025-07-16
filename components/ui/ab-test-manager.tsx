"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  TestTube, 
  Trophy, 
  TrendingUp, 
  Users,
  Mail,
  Eye,
  MousePointer
} from "lucide-react";
import type { ABTest, ABTestVariant, Campaign } from "@/lib/types";

interface ABTestManagerProps {
  campaigns: Campaign[];
  onCreateTest: (testData: any) => Promise<void>;
  onUpdateTest: (testId: string, updates: any) => Promise<void>;
}

function ABTestBuilder({ 
  campaign,
  onSave, 
  onCancel 
}: { 
  campaign: Campaign;
  onSave: (data: any) => void; 
  onCancel: () => void; 
}) {
  const [name, setName] = useState('');
  const [testType, setTestType] = useState<'subject' | 'content' | 'send_time' | 'from_name'>('subject');
  const [variants, setVariants] = useState<Partial<ABTestVariant>[]>([
    { name: 'Variant A', content: {} },
    { name: 'Variant B', content: {} }
  ]);
  const [trafficSplit, setTrafficSplit] = useState([50, 50]);
  const [winnerCriteria, setWinnerCriteria] = useState<'open_rate' | 'click_rate' | 'conversion_rate'>('open_rate');

  const updateVariant = (index: number, updates: Partial<ABTestVariant>) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], ...updates };
    setVariants(newVariants);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      campaign_id: campaign.id,
      test_type: testType,
      variants: variants.map((v, i) => ({
        ...v,
        id: `variant_${i}`,
        stats: {
          total_sent: 0,
          delivered: 0,
          opens: 0,
          unique_opens: 0,
          clicks: 0,
          unique_clicks: 0,
          bounces: 0,
          complaints: 0,
          unsubscribes: 0,
          open_rate: 0,
          click_rate: 0,
          bounce_rate: 0,
          unsubscribe_rate: 0,
        }
      })),
      traffic_split: trafficSplit,
      winner_criteria: winnerCriteria,
      status: 'draft',
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Test Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Subject Line Test"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Test Type</label>
          <Select value={testType} onValueChange={(value: any) => setTestType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="subject">Subject Line</SelectItem>
              <SelectItem value="content">Email Content</SelectItem>
              <SelectItem value="send_time">Send Time</SelectItem>
              <SelectItem value="from_name">From Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Winner Criteria</label>
          <Select value={winnerCriteria} onValueChange={(value: any) => setWinnerCriteria(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open_rate">Open Rate</SelectItem>
              <SelectItem value="click_rate">Click Rate</SelectItem>
              <SelectItem value="conversion_rate">Conversion Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Variants</h3>
        
        {variants.map((variant, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-base">
                {variant.name} ({trafficSplit[index]}% traffic)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Variant Name</label>
                <Input
                  value={variant.name || ''}
                  onChange={(e) => updateVariant(index, { name: e.target.value })}
                  placeholder={`Variant ${String.fromCharCode(65 + index)}`}
                />
              </div>

              {testType === 'subject' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Subject Line</label>
                  <Input
                    value={variant.content?.subject || ''}
                    onChange={(e) => updateVariant(index, { 
                      content: { ...variant.content, subject: e.target.value } 
                    })}
                    placeholder="Enter subject line"
                  />
                </div>
              )}

              {testType === 'from_name' && (
                <div>
                  <label className="block text-sm font-medium mb-2">From Name</label>
                  <Input
                    value={variant.content?.from_name || ''}
                    onChange={(e) => updateVariant(index, { 
                      content: { ...variant.content, from_name: e.target.value } 
                    })}
                    placeholder="Enter from name"
                  />
                </div>
              )}

              {testType === 'send_time' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Send Time</label>
                  <Input
                    type="time"
                    value={variant.content?.send_time || ''}
                    onChange={(e) => updateVariant(index, { 
                      content: { ...variant.content, send_time: e.target.value } 
                    })}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Traffic Split (%)</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={trafficSplit[0]}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setTrafficSplit([value, 100 - value]);
                }}
                min="10"
                max="90"
              />
              <Input
                type="number"
                value={trafficSplit[1]}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setTrafficSplit([100 - value, value]);
                }}
                min="10"
                max="90"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!name.trim()}>
          Create A/B Test
        </Button>
      </div>
    </div>
  );
}

export function ABTestManager({ campaigns, onCreateTest, onUpdateTest }: ABTestManagerProps) {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const handleCreateTest = async (testData: any) => {
    try {
      await onCreateTest(testData);
      setShowBuilder(false);
      setSelectedCampaign(null);
    } catch (error) {
      console.error('Error creating A/B test:', error);
      alert('Failed to create A/B test');
    }
  };

  const startTest = async (testId: string) => {
    try {
      await onUpdateTest(testId, { 
        status: 'running',
        started_at: new Date().toISOString()
      });
      // Refresh tests
    } catch (error) {
      console.error('Error starting test:', error);
      alert('Failed to start test');
    }
  };

  const stopTest = async (testId: string) => {
    try {
      await onUpdateTest(testId, { 
        status: 'completed',
        completed_at: new Date().toISOString()
      });
      // Refresh tests
    } catch (error) {
      console.error('Error stopping test:', error);
      alert('Failed to stop test');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">A/B Testing</h2>
          <p className="text-gray-600">Test different versions to optimize performance</p>
        </div>
        <Button 
          onClick={() => setShowBuilder(true)}
          disabled={campaigns.length === 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create A/B Test
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running Tests</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tests.filter(t => t.status === 'running').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tests</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tests.filter(t => t.status === 'completed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Improvement</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.3%</div>
          </CardContent>
        </Card>
      </div>

      {/* Tests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your A/B Tests</CardTitle>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <div className="text-center py-12">
              <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No A/B tests yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first A/B test to optimize your campaigns
              </p>
              <Button 
                onClick={() => setShowBuilder(true)}
                disabled={campaigns.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First A/B Test
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Winner</TableHead>
                  <TableHead>Improvement</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell>
                      <div className="font-medium">{test.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {test.test_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={test.status === 'running' ? 'default' : 'secondary'}
                        className={test.status === 'running' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {test.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-full">
                        <Progress value={test.status === 'completed' ? 100 : 45} className="w-20" />
                        <div className="text-xs text-gray-600 mt-1">
                          {test.status === 'completed' ? '100%' : '45%'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {test.winner_variant_id ? (
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">
                            {test.variants.find(v => v.id === test.winner_variant_id)?.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-green-600 font-medium">+8.2%</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {test.status === 'draft' && (
                          <Button size="sm" onClick={() => startTest(test.id)}>
                            Start
                          </Button>
                        )}
                        {test.status === 'running' && (
                          <Button size="sm" variant="outline" onClick={() => stopTest(test.id)}>
                            Stop
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Campaign Selection Dialog */}
      <Dialog open={showBuilder && !selectedCampaign} onOpenChange={setShowBuilder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Campaign for A/B Test</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">Choose a campaign to create an A/B test for:</p>
            <div className="space-y-2">
              {campaigns.filter(c => c.status === 'draft').map((campaign) => (
                <div
                  key={campaign.id}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedCampaign(campaign)}
                >
                  <div className="font-medium">{campaign.title}</div>
                  <div className="text-sm text-gray-600">
                    Created {new Date(campaign.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
            {campaigns.filter(c => c.status === 'draft').length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No draft campaigns available. Create a campaign first.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* A/B Test Builder Dialog */}
      <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create A/B Test</DialogTitle>
          </DialogHeader>
          {selectedCampaign && (
            <ABTestBuilder
              campaign={selectedCampaign}
              onSave={handleCreateTest}
              onCancel={() => setSelectedCampaign(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}