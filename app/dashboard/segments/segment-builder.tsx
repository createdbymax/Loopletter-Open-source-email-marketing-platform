"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, Tag, Mail, Calendar, MapPin, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
interface Condition {
    id: string;
    field: string;
    operator: string;
    value: any;
    logic: 'and' | 'or';
}
const FIELD_OPTIONS = [
    { value: 'email', label: 'Email', type: 'text' },
    { value: 'name', label: 'Name', type: 'text' },
    { value: 'tags', label: 'Tags', type: 'tags' },
    { value: 'created_at', label: 'Date Added', type: 'date' },
    { value: 'custom_fields.city', label: 'City', type: 'text' },
    { value: 'custom_fields.country', label: 'Country', type: 'text' },
];
const OPERATOR_OPTIONS = {
    text: [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Does not equal' },
        { value: 'contains', label: 'Contains' },
        { value: 'not_contains', label: 'Does not contain' },
    ],
    tags: [
        { value: 'contains', label: 'Has tag' },
        { value: 'not_contains', label: 'Does not have tag' },
    ],
    date: [
        { value: 'greater_than', label: 'After' },
        { value: 'less_than', label: 'Before' },
    ],
};
export function SegmentBuilder() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [conditions, setConditions] = useState<Condition[]>([
        { id: '1', field: 'email', operator: 'contains', value: '', logic: 'and' },
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const addCondition = () => {
        const newCondition: Condition = {
            id: Date.now().toString(),
            field: 'email',
            operator: 'contains',
            value: '',
            logic: 'and',
        };
        setConditions([...conditions, newCondition]);
    };
    const removeCondition = (id: string) => {
        if (conditions.length === 1) {
            return;
        }
        setConditions(conditions.filter(c => c.id !== id));
    };
    const updateCondition = (id: string, field: keyof Condition, value: any) => {
        setConditions(conditions.map(c => {
            if (c.id === id) {
                if (field === 'field') {
                    const fieldType = FIELD_OPTIONS.find(f => f.value === value)?.type || 'text';
                    return {
                        ...c,
                        [field]: value,
                        operator: OPERATOR_OPTIONS[fieldType as keyof typeof OPERATOR_OPTIONS][0].value
                    };
                }
                return { ...c, [field]: value };
            }
            return c;
        }));
    };
    const getFieldIcon = (field: string) => {
        switch (field) {
            case 'email':
                return <Mail className="h-4 w-4"/>;
            case 'tags':
                return <Tag className="h-4 w-4"/>;
            case 'created_at':
                return <Calendar className="h-4 w-4"/>;
            case 'custom_fields.city':
            case 'custom_fields.country':
                return <MapPin className="h-4 w-4"/>;
            default:
                return null;
        }
    };
    const getFieldType = (field: string) => {
        return FIELD_OPTIONS.find(f => f.value === field)?.type || 'text';
    };
    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Segment name is required');
            return;
        }
        if (conditions.some(c => c.value === '')) {
            setError('All condition values must be filled');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const formattedConditions = conditions.map(({ id, ...rest }) => rest);
            const response = await fetch('/api/segments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    description,
                    conditions: formattedConditions,
                }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create segment');
            }
            router.push('/dashboard/segments');
            router.refresh();
        }
        catch (error: any) {
            console.error('Error creating segment:', error);
            setError(error.message || 'Failed to create segment');
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Create Segment</h1>
          <p className="text-gray-600">Define conditions to group your fans</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Segment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Segment Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Active Subscribers, Recent Signups"/>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what this segment is for" rows={3}/>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {conditions.map((condition, index) => (<div key={condition.id} className="space-y-4">
              {index > 0 && (<div className="flex items-center">
                  <hr className="flex-grow border-t border-gray-200"/>
                  <Select value={condition.logic} onValueChange={(value) => updateCondition(condition.id, 'logic', value as 'and' | 'or')}>
                    <SelectTrigger className="w-20 mx-4">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="and">AND</SelectItem>
                      <SelectItem value="or">OR</SelectItem>
                    </SelectContent>
                  </Select>
                  <hr className="flex-grow border-t border-gray-200"/>
                </div>)}

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <Label>Field</Label>
                  <Select value={condition.field} onValueChange={(value) => updateCondition(condition.id, 'field', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_OPTIONS.map((option) => (<SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            {getFieldIcon(option.value)}
                            <span className="ml-2">{option.label}</span>
                          </div>
                        </SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-3">
                  <Label>Operator</Label>
                  <Select value={condition.operator} onValueChange={(value) => updateCondition(condition.id, 'operator', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATOR_OPTIONS[getFieldType(condition.field) as keyof typeof OPERATOR_OPTIONS].map((option) => (<SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-4">
                  <Label>Value</Label>
                  <Input value={condition.value} onChange={(e) => updateCondition(condition.id, 'value', e.target.value)} placeholder="Enter value" type={condition.field === 'created_at' ? 'date' : 'text'}/>
                </div>

                <div className="col-span-1 flex items-end">
                  <Button variant="ghost" size="icon" onClick={() => removeCondition(condition.id)} disabled={conditions.length === 1}>
                    <Trash2 className="h-4 w-4"/>
                  </Button>
                </div>
              </div>
            </div>))}

          <Button variant="outline" onClick={addCondition} className="w-full">
            <Plus className="h-4 w-4 mr-2"/>
            Add Condition
          </Button>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/dashboard/segments')}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (<>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin"/>
                Creating...
              </>) : (<>
                <Save className="h-4 w-4 mr-2"/>
                Create Segment
              </>)}
          </Button>
        </CardFooter>
      </Card>

      {error && (<div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          {error}
        </div>)}
    </div>);
}
