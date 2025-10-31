import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SplitSquareVertical, Mail, Clock, Type, User, Lock, BarChart3 } from 'lucide-react';
import { Artist, Campaign } from '@/lib/types';
import { FeatureGate } from '@/components/ui/feature-access';
interface ABTestManagerProps {
    artist: Artist;
    campaign: Campaign;
    onSave: (testData: any) => void;
}
export function ABTestManager({ artist, campaign, onSave }: ABTestManagerProps) {
    const [testType, setTestType] = useState<'subject' | 'content' | 'send_time' | 'from_name'>('subject');
    const [variants, setVariants] = useState([
        { name: 'Variant A', content: '' },
        { name: 'Variant B', content: '' }
    ]);
    const [trafficSplit, setTrafficSplit] = useState([50, 50]);
    const [winnerCriteria, setWinnerCriteria] = useState<'open_rate' | 'click_rate' | 'conversion_rate'>('open_rate');
    const handleAddVariant = () => {
        if (variants.length >= 4)
            return;
        const newVariant = {
            name: `Variant ${String.fromCharCode(65 + variants.length)}`,
            content: ''
        };
        setVariants([...variants, newVariant]);
        const newSplit = Array(variants.length + 1).fill(Math.floor(100 / (variants.length + 1)));
        const sum = newSplit.reduce((a, b) => a + b, 0);
        if (sum < 100) {
            newSplit[newSplit.length - 1] += (100 - sum);
        }
        setTrafficSplit(newSplit);
    };
    const handleRemoveVariant = (index: number) => {
        if (variants.length <= 2)
            return;
        const newVariants = [...variants];
        newVariants.splice(index, 1);
        setVariants(newVariants);
        const newSplit = Array(newVariants.length).fill(Math.floor(100 / newVariants.length));
        const sum = newSplit.reduce((a, b) => a + b, 0);
        if (sum < 100) {
            newSplit[newSplit.length - 1] += (100 - sum);
        }
        setTrafficSplit(newSplit);
    };
    const handleUpdateVariant = (index: number, field: string, value: string) => {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setVariants(newVariants);
    };
    const handleUpdateSplit = (index: number, value: number) => {
        value = Math.max(1, Math.min(99, value));
        const remaining = 100 - value;
        const newSplit = [...trafficSplit];
        newSplit[index] = value;
        const otherSum = trafficSplit.reduce((sum, val, i) => i !== index ? sum + val : sum, 0);
        for (let i = 0; i < newSplit.length; i++) {
            if (i !== index) {
                newSplit[i] = otherSum === 0
                    ? remaining / (newSplit.length - 1)
                    : Math.round((trafficSplit[i] / otherSum) * remaining);
            }
        }
        const sum = newSplit.reduce((a, b) => a + b, 0);
        if (sum !== 100) {
            for (let i = 0; i < newSplit.length; i++) {
                if (i !== index) {
                    newSplit[i] += (100 - sum);
                    break;
                }
            }
        }
        setTrafficSplit(newSplit);
    };
    const handleSaveTest = () => {
        const testData = {
            campaign_id: campaign.id,
            test_type: testType,
            variants: variants.map((variant, index) => ({
                name: variant.name,
                content: variant.content,
                traffic_percentage: trafficSplit[index]
            })),
            winner_criteria: winnerCriteria
        };
        onSave(testData);
    };
    const getTestTypeIcon = () => {
        switch (testType) {
            case 'subject':
                return <Type className="h-5 w-5"/>;
            case 'content':
                return <Mail className="h-5 w-5"/>;
            case 'send_time':
                return <Clock className="h-5 w-5"/>;
            case 'from_name':
                return <User className="h-5 w-5"/>;
            default:
                return <SplitSquareVertical className="h-5 w-5"/>;
        }
    };
    return (<FeatureGate feature="advancedAnalytics" artist={artist} fallback={<Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5"/>
              A/B Testing
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <SplitSquareVertical className="h-16 w-16 mx-auto text-gray-400 mb-4"/>
            <h3 className="text-xl font-medium mb-2">Unlock A/B Testing</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              A/B testing allows you to test different versions of your emails to see which performs better.
              This feature is available on the Independent and Label plans.
            </p>
            <Button>Upgrade to Independent Plan</Button>
          </CardContent>
        </Card>}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getTestTypeIcon()}
            A/B Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>What would you like to test?</Label>
              <Select value={testType} onValueChange={(value) => setTestType(value as any)}>
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
            
            <Tabs defaultValue="variants" className="space-y-4">
              <TabsList>
                <TabsTrigger value="variants">Variants</TabsTrigger>
                <TabsTrigger value="settings">Test Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="variants" className="space-y-4">
                {variants.map((variant, index) => (<div key={index} className="space-y-2 p-4 border rounded-md">
                    <div className="flex items-center justify-between">
                      <Label>
                        {variant.name} ({trafficSplit[index]}% of audience)
                      </Label>
                      {variants.length > 2 && (<Button variant="ghost" size="sm" onClick={() => handleRemoveVariant(index)}>
                          Remove
                        </Button>)}
                    </div>
                    
                    {testType === 'subject' && (<Input value={variant.content} onChange={(e) => handleUpdateVariant(index, 'content', e.target.value)} placeholder="Enter subject line variant"/>)}
                    
                    {testType === 'content' && (<textarea value={variant.content} onChange={(e) => handleUpdateVariant(index, 'content', e.target.value)} placeholder="Enter email content variant" className="w-full h-24 p-2 border rounded-md"/>)}
                    
                    {testType === 'send_time' && (<Input type="datetime-local" value={variant.content} onChange={(e) => handleUpdateVariant(index, 'content', e.target.value)}/>)}
                    
                    {testType === 'from_name' && (<Input value={variant.content} onChange={(e) => handleUpdateVariant(index, 'content', e.target.value)} placeholder="Enter from name variant"/>)}
                    
                    <div>
                      <Label className="text-sm">Traffic Percentage</Label>
                      <div className="flex items-center gap-2">
                        <input type="range" min="1" max="99" value={trafficSplit[index]} onChange={(e) => handleUpdateSplit(index, parseInt(e.target.value))} className="flex-1"/>
                        <span className="text-sm font-medium w-10 text-right">
                          {trafficSplit[index]}%
                        </span>
                      </div>
                    </div>
                  </div>))}
                
                {variants.length < 4 && (<Button variant="outline" onClick={handleAddVariant} className="w-full">
                    Add Another Variant
                  </Button>)}
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-2">
                  <Label>Winner Selection Criteria</Label>
                  <Select value={winnerCriteria} onValueChange={(value) => setWinnerCriteria(value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open_rate">Open Rate</SelectItem>
                      <SelectItem value="click_rate">Click Rate</SelectItem>
                      <SelectItem value="conversion_rate">Conversion Rate</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    This determines how the winning variant will be selected.
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-blue-600"/>
                    <h4 className="text-sm font-medium text-blue-800">How A/B Testing Works</h4>
                  </div>
                  <ul className="text-xs text-blue-700 space-y-1 list-disc pl-5">
                    <li>Your variants will be sent to the specified percentages of your audience</li>
                    <li>Results will be tracked based on your selected criteria</li>
                    <li>You can manually select a winner or let the system automatically choose</li>
                    <li>The winning variant can be used for future campaigns</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
            
            <Button onClick={handleSaveTest} className="w-full">
              Save A/B Test
            </Button>
          </div>
        </CardContent>
      </Card>
    </FeatureGate>);
}
