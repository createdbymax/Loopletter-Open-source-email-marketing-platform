"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Target, 
  Plus, 
  Trash2, 
  Edit, 
  Users, 
  Tag, 
  Mail, 
  Calendar, 
  MousePointer, 
  Lock 
} from 'lucide-react';
import { Artist, Segment, SegmentCondition } from '@/lib/types';
import { FeatureGate } from '@/components/ui/feature-access';

interface SegmentManagerProps {
  artist: Artist;
}

export function SegmentManager({ artist }: SegmentManagerProps) {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // New segment form state
  const [newSegment, setNewSegment] = useState({
    name: '',
    description: '',
    conditions: [
      { field: 'tags', operator: 'contains', value: '', logic: 'and' }
    ] as SegmentCondition[]
  });

  useEffect(() => {
    async function fetchSegments() {
      try {
        setLoading(true);
        const response = await fetch('/api/segments');
        
        if (!response.ok) {
          if (response.status === 403) {
            // Feature access denied
            setSegments([]);
            setLoading(false);
            return;
          }
          throw new Error('Failed to fetch segments');
        }
        
        const data = await response.json();
        setSegments(data);
      } catch (error) {
        console.error('Error fetching segments:', error);
        setError('Could not load segments');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSegments();
  }, []);

  const handleCreateSegment = async () => {
    try {
      setIsCreating(true);
      
      const response = await fetch('/api/segments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSegment),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create segment');
      }
      
      const createdSegment = await response.json();
      setSegments([...segments, createdSegment]);
      
      // Reset form
      setNewSegment({
        name: '',
        description: '',
        conditions: [
          { field: 'tags', operator: 'contains', value: '', logic: 'and' }
        ]
      });
      
    } catch (error) {
      console.error('Error creating segment:', error);
      setError('Failed to create segment');
    } finally {
      setIsCreating(false);
    }
  };

  const addCondition = () => {
    setNewSegment({
      ...newSegment,
      conditions: [
        ...newSegment.conditions,
        { field: 'tags', operator: 'contains', value: '', logic: 'and' }
      ]
    });
  };

  const removeCondition = (index: number) => {
    const updatedConditions = [...newSegment.conditions];
    updatedConditions.splice(index, 1);
    setNewSegment({
      ...newSegment,
      conditions: updatedConditions
    });
  };

  const updateCondition = (index: number, field: string, value: any) => {
    const updatedConditions = [...newSegment.conditions];
    updatedConditions[index] = {
      ...updatedConditions[index],
      [field]: value
    };
    setNewSegment({
      ...newSegment,
      conditions: updatedConditions
    });
  };

  const getFieldIcon = (field: string) => {
    switch (field) {
      case 'tags':
        return <Tag className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'created_at':
        return <Calendar className="h-4 w-4" />;
      case 'opened':
      case 'clicked':
        return <MousePointer className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getConditionDescription = (condition: SegmentCondition) => {
    const { field, operator, value } = condition;
    
    // Map field names to display labels
    const fieldLabels: Record<string, string> = {
      'tags': 'Tag',
      'opened': 'Opened Email',
      'clicked': 'Clicked Link',
      'created_at': 'Subscribed Date'
    };
    
    const fieldLabel = fieldLabels[field] || field;
    
    // Map operators to display text
    const operatorLabels: Record<string, string> = {
      'equals': 'is',
      'not_equals': 'is not',
      'contains': 'contains',
      'not_contains': 'does not contain',
      'greater_than': 'is after',
      'less_than': 'is before',
      'in': 'is in',
      'not_in': 'is not in'
    };
    
    const operatorLabel = operatorLabels[operator] || operator;
    
    // Handle array values for 'in' and 'not_in' operators
    const displayValue = Array.isArray(value) 
      ? value.join(', ') 
      : String(value);
    
    return `${fieldLabel} ${operatorLabel} "${displayValue}"`;
  };

  return (
    <FeatureGate
      feature="segmentation"
      artist={artist}
      fallback={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Segments</h1>
              <p className="text-gray-600 mt-2">
                Create targeted groups of subscribers based on their behavior and attributes
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Segmentation
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Target className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">Unlock Segmentation</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Segmentation allows you to create targeted groups of subscribers based on their behavior, 
                interests, and engagement. Upgrade to the Independent plan to access this feature.
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
            <h1 className="text-3xl font-bold text-gray-900">Segments</h1>
            <p className="text-gray-600 mt-2">
              Create targeted groups of subscribers based on their behavior and attributes
            </p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Segment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Segment</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="segment-name">Segment Name</Label>
                  <Input
                    id="segment-name"
                    value={newSegment.name}
                    onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                    placeholder="e.g., Active Subscribers, Recent Fans"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="segment-description">Description (Optional)</Label>
                  <Input
                    id="segment-description"
                    value={newSegment.description}
                    onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
                    placeholder="What is this segment for?"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Conditions</Label>
                  <p className="text-sm text-gray-600">
                    Define who should be included in this segment
                  </p>
                  
                  <div className="space-y-3 mt-3">
                    {newSegment.conditions.map((condition, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {index > 0 && (
                          <Select
                            value={condition.logic}
                            onValueChange={(value) => updateCondition(index, 'logic', value)}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="and">AND</SelectItem>
                              <SelectItem value="or">OR</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        
                        <Select
                          value={condition.field}
                          onValueChange={(value) => updateCondition(index, 'field', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tags">Tags</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="created_at">Subscribed Date</SelectItem>
                            <SelectItem value="opened">Opened Email</SelectItem>
                            <SelectItem value="clicked">Clicked Link</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={condition.operator}
                          onValueChange={(value) => updateCondition(index, 'operator', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {condition.field === 'tags' || condition.field === 'email' ? (
                              <>
                                <SelectItem value="contains">contains</SelectItem>
                                <SelectItem value="not_contains">doesn't contain</SelectItem>
                                <SelectItem value="equals">equals</SelectItem>
                                <SelectItem value="not_equals">doesn't equal</SelectItem>
                              </>
                            ) : condition.field === 'created_at' ? (
                              <>
                                <SelectItem value="greater_than">is after</SelectItem>
                                <SelectItem value="less_than">is before</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="equals">has</SelectItem>
                                <SelectItem value="not_equals">has not</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        
                        <Input
                          value={typeof condition.value === 'boolean' ? String(condition.value) : condition.value}
                          onChange={(e) => {
                            // Convert 'true'/'false' strings back to boolean if needed
                            let newValue: string | number | boolean | string[] = e.target.value;
                            if (condition.value === true || condition.value === false) {
                              newValue = e.target.value === 'true';
                            }
                            updateCondition(index, 'value', newValue);
                          }}
                          placeholder="Value"
                          className="flex-1"
                        />
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCondition(index)}
                          disabled={newSegment.conditions.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addCondition}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Condition
                    </Button>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={handleCreateSegment} 
                  disabled={isCreating || !newSegment.name}
                >
                  {isCreating ? 'Creating...' : 'Create Segment'}
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
        ) : segments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">No Segments Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Create your first segment to target specific groups of subscribers based on their behavior and attributes.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Segment
                  </Button>
                </DialogTrigger>
                {/* Dialog content is the same as above */}
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Conditions</TableHead>
                    <TableHead>Subscribers</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {segments.map((segment) => (
                    <TableRow key={segment.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          {segment.name}
                        </div>
                        {segment.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {segment.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {segment.conditions.map((condition, i) => (
                            <div key={i} className="flex items-center gap-1 text-sm">
                              {i > 0 && (
                                <span className="text-xs font-medium bg-gray-100 px-1.5 py-0.5 rounded">
                                  {condition.logic?.toUpperCase()}
                                </span>
                              )}
                              <div className="flex items-center gap-1">
                                {getFieldIcon(condition.field)}
                                <span>{getConditionDescription(condition)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{segment.fan_count}</span>
                      </TableCell>
                      <TableCell>
                        {new Date(segment.created_at).toLocaleDateString()}
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
      </div>
    </FeatureGate>
  );
}