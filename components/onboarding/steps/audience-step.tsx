"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Users, Upload, UserPlus, Mail, Trash2, Plus, Download, AlertCircle } from 'lucide-react';
import { Artist } from '@/lib/types';
interface AudienceStepProps {
    artist: Artist;
    onNext: () => void;
    onStepComplete: () => void;
}
export function AudienceStep({ artist, onNext, onStepComplete }: AudienceStepProps) {
    const [activeTab, setActiveTab] = useState('manual');
    const [loading, setLoading] = useState(false);
    const [manualFans, setManualFans] = useState([
        { email: '', name: '' }
    ]);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvPreview, setCsvPreview] = useState<string[][]>([]);
    const [singleFan, setSingleFan] = useState({ email: '', name: '' });
    const addManualFan = () => {
        setManualFans(prev => [...prev, { email: '', name: '' }]);
    };
    const removeManualFan = (index: number) => {
        setManualFans(prev => prev.filter((_, i) => i !== index));
    };
    const updateManualFan = (index: number, field: 'email' | 'name', value: string) => {
        setManualFans(prev => prev.map((fan, i) => i === index ? { ...fan, [field]: value } : fan));
    };
    const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCsvFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                const lines = text.split('\n').slice(0, 6);
                const preview = lines.map(line => line.split(','));
                setCsvPreview(preview);
            };
            reader.readAsText(file);
        }
    };
    const downloadTemplate = () => {
        const csvContent = "email,name,tags\nexample@email.com,John Doe,fan\nanother@email.com,Jane Smith,vip";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fan-import-template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };
    const handleSubmit = async () => {
        setLoading(true);
        try {
            let fansToAdd: any[] = [];
            if (activeTab === 'manual') {
                fansToAdd = manualFans.filter(fan => fan.email.trim());
            }
            else if (activeTab === 'single') {
                if (singleFan.email.trim()) {
                    fansToAdd = [singleFan];
                }
            }
            else if (activeTab === 'csv' && csvFile) {
                const formData = new FormData();
                formData.append('file', csvFile);
                const uploadResponse = await fetch('/api/fans/import', {
                    method: 'POST',
                    body: formData,
                });
                if (uploadResponse.ok) {
                    onStepComplete();
                    onNext();
                    return;
                }
                else {
                    throw new Error('Failed to upload CSV');
                }
            }
            if (fansToAdd.length > 0) {
                const response = await fetch('/api/fans', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fans: fansToAdd.map(fan => ({
                            ...fan,
                            source: 'onboarding',
                        })),
                    }),
                });
                if (response.ok) {
                    onStepComplete();
                    onNext();
                }
                else {
                    throw new Error('Failed to add fans');
                }
            }
            else {
                onNext();
            }
        }
        catch (error) {
            console.error('Error adding fans:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const canContinue = () => {
        if (activeTab === 'manual') {
            return manualFans.some(fan => fan.email.trim());
        }
        else if (activeTab === 'single') {
            return singleFan.email.trim();
        }
        else if (activeTab === 'csv') {
            return csvFile !== null;
        }
        return true;
    };
    return (<div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-100 mb-4">
          <Users className="w-4 h-4 text-green-600"/>
          <span className="text-sm font-medium text-green-800">Build your audience</span>
        </div>
        <p className="text-gray-600 text-lg">
          Add your first fans to start building your email list. You can always add more later.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl blur-xl"></div>
          <TabsList className="relative grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-white/20 shadow-sm rounded-2xl p-2">
            <TabsTrigger value="single" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">
              Add One Fan
            </TabsTrigger>
            <TabsTrigger value="manual" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">
              Add Multiple
            </TabsTrigger>
            <TabsTrigger value="csv" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">
              Import CSV
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="single" className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-white/20 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl">
                  <UserPlus className="w-6 h-6 text-white"/>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Add Your First Fan</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="single-email" className="text-sm font-medium text-gray-700 mb-2 block">
                    Email Address *
                  </Label>
                  <Input id="single-email" type="email" value={singleFan.email} onChange={(e) => setSingleFan(prev => ({ ...prev, email: e.target.value }))} placeholder="fan@example.com" className="h-12 bg-white/80 border-gray-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl"/>
                </div>
                <div>
                  <Label htmlFor="single-name" className="text-sm font-medium text-gray-700 mb-2 block">
                    Name (Optional)
                  </Label>
                  <Input id="single-name" value={singleFan.name} onChange={(e) => setSingleFan(prev => ({ ...prev, name: e.target.value }))} placeholder="Fan's name" className="h-12 bg-white/80 border-gray-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl"/>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-white/20 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
                    <Users className="w-6 h-6 text-white"/>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Add Multiple Fans</h3>
                </div>
                <Button variant="outline" size="sm" onClick={addManualFan} className="bg-white/80 hover:bg-white border-purple-200 hover:border-purple-300 text-purple-700 rounded-xl">
                  <Plus className="w-4 h-4 mr-2"/>
                  Add Row
                </Button>
              </div>
              
              <div className="space-y-4">
                {manualFans.map((fan, index) => (<div key={index} className="flex items-center space-x-4 p-4 bg-white/60 rounded-xl border border-white/40">
                    <div className="flex-1">
                      <Input type="email" value={fan.email} onChange={(e) => updateManualFan(index, 'email', e.target.value)} placeholder="Email address" className="h-12 bg-white/80 border-gray-200 focus:border-purple-300 focus:ring-purple-200 rounded-xl"/>
                    </div>
                    <div className="flex-1">
                      <Input value={fan.name} onChange={(e) => updateManualFan(index, 'name', e.target.value)} placeholder="Name (optional)" className="h-12 bg-white/80 border-gray-200 focus:border-purple-300 focus:ring-purple-200 rounded-xl"/>
                    </div>
                    {manualFans.length > 1 && (<Button variant="ghost" size="sm" onClick={() => removeManualFan(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl">
                        <Trash2 className="w-4 h-4"/>
                      </Button>)}
                  </div>))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="csv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5"/>
                <span>Import from CSV</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2"/>
                <div className="space-y-2">
                  <Label htmlFor="csv-upload" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500">
                      Click to upload your CSV file
                    </span>
                    <Input id="csv-upload" type="file" accept=".csv" onChange={handleCsvUpload} className="hidden"/>
                  </Label>
                  <p className="text-sm text-gray-500">
                    or drag and drop your file here
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="w-4 h-4 mr-2"/>
                  Download Template
                </Button>
                {csvFile && (<span className="text-sm text-green-600">
                    ✓ {csvFile.name} uploaded
                  </span>)}
              </div>

              {csvPreview.length > 0 && (<div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Preview:</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {csvPreview[0]?.map((header: string, index: number) => (<th key={index} className="text-left p-2 font-medium">
                              {header}
                            </th>))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.slice(1, 6).map((row: string[], index: number) => (<tr key={index} className="border-b">
                            {row.map((cell: string, cellIndex: number) => (<td key={cellIndex} className="p-2">
                                {cell}
                              </td>))}
                          </tr>))}
                      </tbody>
                    </table>
                  </div>
                  {csvPreview.length > 6 && (<p className="text-xs text-gray-500 mt-2">
                      Showing first 5 rows. Full file will be imported.
                    </p>)}
                </div>)}

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5"/>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">CSV Format Requirements:</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• Required column: email</li>
                      <li>• Optional columns: name, tags</li>
                      <li>• First row should contain column headers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <div className="flex justify-between items-center pt-8">
          <Button variant="ghost" onClick={onNext} className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl">
            Skip for now
          </Button>
          
          <Button onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none">
            {loading ? (<>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Adding Fans...
              </>) : (<>
                Continue
                <ArrowRight className="w-5 h-5 ml-2"/>
              </>)}
          </Button>
        </div>
      </Tabs>
    </div>);
}
