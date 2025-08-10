"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Download,
  RefreshCw,
  Eye,
  ArrowRight
} from 'lucide-react';

interface CSVPreview {
  headers: string[];
  rows: string[][];
  totalRows: number;
}

interface ColumnMapping {
  email: string;
  name: string;
  [key: string]: string;
}

export function FanImport() {
  const [activeTab, setActiveTab] = useState('csv');
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState('');
  const [manualEmails, setManualEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    imported: number;
    failed?: number;
    errors?: any[];
    message?: string;
  } | null>(null);
  const [progress, setProgress] = useState(0);
  const [csvPreview, setCsvPreview] = useState<CSVPreview | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    email: '',
    name: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Poll job status
  useEffect(() => {
    if (!jobId) return;

    const pollJob = async () => {
      try {
        const response = await fetch(`/api/fans/import/${jobId}`);
        if (response.ok) {
          const job = await response.json();
          setJobStatus(job);
          setProgress(job.progress);

          if (job.status === 'completed' || job.status === 'failed') {
            setLoading(false);
            if (job.status === 'completed' && job.result) {
              setResult({
                success: true,
                imported: job.result.imported,
                failed: job.result.failed,
                errors: job.result.errors,
                message: `Successfully imported ${job.result.imported} fans${job.result.failed > 0 ? ` (${job.result.failed} failed)` : ''}${job.result.skipped > 0 ? ` (${job.result.skipped} skipped)` : ''}`
              });
            } else if (job.status === 'failed') {
              setResult({
                success: false,
                imported: 0,
                failed: 1,
                errors: [{ email: 'N/A', error: job.error_message || 'Import failed' }],
              });
            }
            setJobId(null);
            setJobStatus(null);
          }
        }
      } catch (error) {
        console.error('Error polling job status:', error);
      }
    };

    const interval = setInterval(pollJob, 2000);
    pollJob(); // Initial poll

    return () => clearInterval(interval);
  }, [jobId]);

  const parseCSVLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const previewCSV = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('Empty file');
      }

      const headers = parseCSVLine(lines[0]).map(h => h.trim());
      const rows = lines.slice(1, Math.min(6, lines.length)).map(line => parseCSVLine(line));
      
      setCsvPreview({
        headers,
        rows,
        totalRows: lines.length - 1
      });

      // Auto-detect email and name columns
      const emailColumn = headers.find(h => 
        h.toLowerCase().includes('email') || 
        h.toLowerCase().includes('e-mail') ||
        h.toLowerCase().includes('mail')
      ) || '';
      
      const nameColumn = headers.find(h => 
        h.toLowerCase().includes('name') || 
        h.toLowerCase().includes('full') ||
        h.toLowerCase().includes('first')
      ) || '';

      setColumnMapping({
        email: emailColumn,
        name: nameColumn || ""
      });

      setShowPreview(true);
    } catch (error) {
      console.error('Error previewing CSV:', error);
      alert('Error reading CSV file. Please check the file format.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setShowPreview(false);
      setCsvPreview(null);
      setResult(null);
      
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        previewCSV(selectedFile);
      }
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
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setShowPreview(false);
      setCsvPreview(null);
      setResult(null);
      
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        previewCSV(droppedFile);
      }
    }
  };

  const handleCSVImport = async () => {
    if (!file || !columnMapping.email || loading) return;
    
    setLoading(true);
    setProgress(0);
    setResult(null);
    setJobStatus(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tags', tags);
      formData.append('source', 'csv_import');
      formData.append('columnMapping', JSON.stringify(columnMapping));
      formData.append('skipDuplicates', skipDuplicates.toString());
      
      const response = await fetch('/api/fans/import', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import fans');
      }
      
      const data = await response.json();
      
      if (data.success && data.job_id) {
        setJobId(data.job_id);
        // Reset form since job is created
        setFile(null);
        setCsvPreview(null);
        setShowPreview(false);
        setColumnMapping({ email: '', name: '' });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(data.message || 'Failed to create import job');
      }
    } catch (error: unknown) {
      console.error('Error importing fans:', error instanceof Error ? error.message : String(error));
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setProgress(0);
      setResult({
        success: false,
        imported: 0,
        failed: 1,
        errors: [{ email: 'N/A', error: errorMessage }],
      });
      setLoading(false);
    }
  };

  const handleManualImport = async () => {
    if (!manualEmails.trim() || loading) return;
    
    setLoading(true);
    setProgress(0);
    setResult(null);
    setJobStatus(null);
    
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
      formData.append('skipDuplicates', skipDuplicates.toString());
      
      const response = await fetch('/api/fans/import', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import fans');
      }
      
      const data = await response.json();
      
      if (data.success && data.job_id) {
        setJobId(data.job_id);
        // Reset form since job is created
        setManualEmails('');
      } else {
        throw new Error(data.message || 'Failed to create import job');
      }
    } catch (error: unknown) {
      console.error('Error importing fans:', error instanceof Error ? error.message : String(error));
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setProgress(0);
      setResult({
        success: false,
        imported: 0,
        failed: 1,
        errors: [{ email: 'N/A', error: errorMessage }],
      });
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
    setCsvPreview(null);
    setShowPreview(false);
    setColumnMapping({ email: '', name: '' });
    setSkipDuplicates(true);
    setJobId(null);
    setJobStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
          {!showPreview ? (
            <Card>
              <CardHeader>
                <CardTitle>Import from CSV</CardTitle>
                <CardDescription>
                  Upload a CSV file with your fan data. We'll help you map the columns correctly.
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
                      <Button variant="outline" size="sm" onClick={() => {
                        setFile(null);
                        setCsvPreview(null);
                        setShowPreview(false);
                      }}>
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
              </CardContent>
            </Card>
          ) : (
            <>
              {/* CSV Preview and Column Mapping */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    CSV Preview
                  </CardTitle>
                  <CardDescription>
                    Preview of your CSV file ({csvPreview?.totalRows} rows total). Map your columns below.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Preview Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-w-full">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {csvPreview?.headers.map((header, index) => (
                              <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] max-w-[200px]">
                                <div className="truncate" title={header}>
                                  {header}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {csvPreview?.rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="px-3 py-2 text-sm text-gray-900 min-w-[100px] max-w-[200px]">
                                  <div className="truncate" title={cell || '-'}>
                                    {cell || '-'}
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Column Mapping */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Column Mapping</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-column">Email Column (Required)</Label>
                        <Select 
                          value={columnMapping.email} 
                          onValueChange={(value) => setColumnMapping(prev => ({ ...prev, email: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select email column" />
                          </SelectTrigger>
                          <SelectContent>
                            {csvPreview?.headers.map((header) => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="name-column">Name Column (Optional)</Label>
                        <Select 
                          value={columnMapping.name || "none"} 
                          onValueChange={(value) => setColumnMapping(prev => ({ ...prev, name: value === "none" ? "" : value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select name column" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {csvPreview?.headers.map((header) => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {!columnMapping.email && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Email Column Required</AlertTitle>
                        <AlertDescription>
                          Please select which column contains the email addresses.
                        </AlertDescription>
                      </Alert>
                    )}
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

                  {/* Skip Duplicates */}
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="skip-duplicates" 
                      checked={skipDuplicates}
                      onCheckedChange={(checked) => setSkipDuplicates(checked as boolean)}
                    />
                    <Label htmlFor="skip-duplicates" className="text-sm">
                      Skip duplicate email addresses
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">
                    When enabled, emails that already exist in your fan list will be skipped instead of causing errors.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setShowPreview(false)}>
                    Back to Upload
                  </Button>
                  <Button 
                    onClick={handleCSVImport} 
                    disabled={!columnMapping.email || loading}
                    className="min-w-[140px]"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        Import {csvPreview?.totalRows} Fans
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </>
          )}
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

              {/* Skip Duplicates */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="manual-skip-duplicates" 
                  checked={skipDuplicates}
                  onCheckedChange={(checked) => setSkipDuplicates(checked as boolean)}
                />
                <Label htmlFor="manual-skip-duplicates" className="text-sm">
                  Skip duplicate email addresses
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button 
                onClick={handleManualImport} 
                disabled={!manualEmails.trim() || loading}
                className="min-w-[120px]"
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
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {jobStatus ? `Processing import (${jobStatus.processed_records}/${jobStatus.total_records} records)...` : 'Starting import...'}
                </span>
                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-gray-500">
                {jobId ? 'Import is running in the background. You can navigate away from this page.' : 'Preparing import job...'}
              </p>
              {jobStatus && (
                <div className="text-xs text-center text-gray-500 space-y-1">
                  <p>Imported: {jobStatus.successful_imports} | Failed: {jobStatus.failed_imports}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
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
              {result.failed !== undefined && (
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{result.failed}</p>
                  <p className="text-sm text-gray-600">Failed to Import</p>
                </div>
              )}
            </div>

            {result.message && (
              <div className="text-center">
                <p className="text-sm text-gray-600">{result.message}</p>
              </div>
            )}

            {result.errors && result.errors.length > 0 && (
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{error.error || error.message}</td>
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