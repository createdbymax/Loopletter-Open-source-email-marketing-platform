"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Download,
  RefreshCw
} from 'lucide-react';

export function FanImport() {
  const [activeTab, setActiveTab] = useState('csv');
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState('');
  const [manualEmails, setManualEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    imported: number;
    failed: number;
    errors: any[];
  } | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleCSVImport = async () => {
    if (!file) return;
    
    setLoading(true);
    setProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tags', tags);
      formData.append('source', 'csv_import');
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 5;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 200);
      
      const response = await fetch('/api/fans/import', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import fans');
      }
      
      const data = await response.json();
      setResult(data);
      
      // Reset form if successful
      if (data.success) {
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error: any) {
      console.error('Error importing fans:', error);
      setResult({
        success: false,
        imported: 0,
        failed: 0,
        errors: [{ error: error.message }],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualImport = async () => {
    if (!manualEmails.trim()) return;
    
    setLoading(true);
    setProgress(0);
    
    try {
      // Parse emails (one per line)
      const emails = manualEmails
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      // Create a CSV in memory
      // Make sure the header row is properly formatted
      const csvContent = [
        'email',
        ...emails.map(email => email.trim()) // Ensure emails are trimmed
      ].join('\n');
      
      const file = new File([csvContent], 'manual-import.csv', { type: 'text/csv' });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tags', tags);
      formData.append('source', 'manual_import');
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 5;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 200);
      
      const response = await fetch('/api/fans/import', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import fans');
      }
      
      const data = await response.json();
      setResult(data);
      
      // Reset form if successful
      if (data.success) {
        setManualEmails('');
      }
    } catch (error: unknown) {
      console.error('Error importing fans:', error);
      setResult({
        success: false,
        imported: 0,
        failed: 0,
        errors: [{ error: error.message }],
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'email,name,city,country\nexample@email.com,John Doe,New York,USA';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fan-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFile(null);
    setTags('');
    setManualEmails('');
    setResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Import Fans</h1>
          <p className="text-gray-600">Add multiple fans to your audience at once</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="csv">CSV Import</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="csv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import from CSV</CardTitle>
              <CardDescription>
                Upload a CSV file with your fan data. The file must have an "email" column.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload Area */}
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="space-y-2">
                    <FileSpreadsheet className="h-10 w-10 text-green-500 mx-auto" />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB • {file.type}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setFile(null)}>
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-10 w-10 text-gray-400 mx-auto" />
                    <p className="font-medium">Drag and drop your CSV file here</p>
                    <p className="text-sm text-gray-500">or</p>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      Browse Files
                    </Button>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept=".csv" 
                      onChange={handleFileChange} 
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                
                <div className="text-sm text-gray-500">
                  Need help? <a href="#" className="text-blue-600 hover:underline">View import guide</a>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (optional)</Label>
                <Input 
                  id="tags" 
                  placeholder="Enter comma-separated tags (e.g. newsletter, website)" 
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Tags help you organize your fans. You can add multiple tags separated by commas.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button 
                onClick={handleCSVImport} 
                disabled={!file || loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  'Import Fans'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manual Entry</CardTitle>
              <CardDescription>
                Enter email addresses manually, one per line.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emails">Email Addresses</Label>
                <Textarea 
                  id="emails" 
                  placeholder="Enter one email address per line" 
                  rows={10}
                  value={manualEmails}
                  onChange={(e) => setManualEmails(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Each line should contain one email address.
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="manual-tags">Tags (optional)</Label>
                <Input 
                  id="manual-tags" 
                  placeholder="Enter comma-separated tags (e.g. newsletter, website)" 
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button 
                onClick={handleManualImport} 
                disabled={!manualEmails.trim() || loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  'Import Fans'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Progress Bar */}
      {loading && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-center text-gray-600">
            Importing fans... {progress}%
          </p>
        </div>
      )}

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Import Complete
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  Import Failed
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{result.imported}</p>
                <p className="text-sm text-gray-600">Successfully Imported</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{result.failed}</p>
                <p className="text-sm text-gray-600">Failed to Import</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Errors</h4>
                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {result.errors.map((error, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{error.email || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{error.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={resetForm}>
              Import More Fans
            </Button>
            <Button asChild>
              <a href="/dashboard/fans">View All Fans</a>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}