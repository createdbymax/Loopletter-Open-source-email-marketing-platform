'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Info
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReputationData {
  current_reputation: {
    reputation: 'excellent' | 'good' | 'fair' | 'poor' | 'suspended';
    can_send: boolean;
    metrics: {
      bounce_rate: number;
      complaint_rate: number;
      engagement_rate: number;
    };
    warnings: string[];
  };
  trends: Array<{
    date: string;
    bounce_rate: number;
    complaint_rate: number;
    engagement_rate: number;
    reputation_score: number;
  }>;
  recommendations: Array<{
    type: 'info' | 'warning' | 'critical';
    title: string;
    message: string;
    action: string;
  }>;
  aws_guidance: {
    bounce_rate_limit: string;
    complaint_rate_limit: string;
    current_status: string;
    next_steps: string[];
  };
  compliance_status: {
    sending_suspended: boolean;
    suspension_reason?: string;
    compliance_flags: string[];
  };
}

export function ReputationDashboard() {
  const [data, setData] = useState<ReputationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReputationData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reputation');
      
      if (!response.ok) {
        throw new Error('Failed to fetch reputation data');
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReputationData();
  }, []);

  const getReputationColor = (reputation: string) => {
    switch (reputation) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-orange-500';
      case 'suspended': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getReputationIcon = (reputation: string) => {
    switch (reputation) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="h-4 w-4" />;
      case 'fair':
        return <Info className="h-4 w-4" />;
      case 'poor':
        return <AlertTriangle className="h-4 w-4" />;
      case 'suspended':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading reputation data...
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error loading reputation data: {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchReputationData}
            className="ml-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sending Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {data.current_reputation.can_send ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-semibold">
                {data.current_reputation.can_send ? 'Active' : 'Suspended'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reputation</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge 
              className={`${getReputationColor(data.current_reputation.reputation)} text-white`}
            >
              <span className="flex items-center gap-1">
                {getReputationIcon(data.current_reputation.reputation)}
                {data.current_reputation.reputation.toUpperCase()}
              </span>
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {data.current_reputation.metrics.bounce_rate.toFixed(2)}%
                </span>
                {data.current_reputation.metrics.bounce_rate > 5 ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
              </div>
              <Progress 
                value={Math.min(data.current_reputation.metrics.bounce_rate, 10) * 10} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">Limit: 5%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Complaint Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {data.current_reputation.metrics.complaint_rate.toFixed(3)}%
                </span>
                {data.current_reputation.metrics.complaint_rate > 0.1 ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
              </div>
              <Progress 
                value={Math.min(data.current_reputation.metrics.complaint_rate * 1000, 100)} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">Limit: 0.1%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warnings and Alerts */}
      {data.current_reputation.warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {data.current_reputation.warnings.map((warning, index) => (
                <div key={index}>• {warning}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {data.compliance_status.sending_suspended && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Account Suspended:</strong> {data.compliance_status.suspension_reason}
          </AlertDescription>
        </Alert>
      )}

      {/* Trends Chart */}
      {data.trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reputation Trends (Last 30 Days)</CardTitle>
            <CardDescription>
              Monitor your sending metrics over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="bounce_rate" 
                    stroke="#ef4444" 
                    name="Bounce Rate (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="complaint_rate" 
                    stroke="#f97316" 
                    name="Complaint Rate (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="engagement_rate" 
                    stroke="#22c55e" 
                    name="Engagement Rate (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Actions to improve your sending reputation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recommendations.map((rec, index) => (
                <Alert key={index} variant={rec.type === 'critical' ? 'destructive' : 'default'}>
                  {rec.type === 'critical' ? (
                    <XCircle className="h-4 w-4" />
                  ) : rec.type === 'warning' ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <Info className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    <div>
                      <strong>{rec.title}:</strong> {rec.message}
                    </div>
                    <div className="mt-1 text-sm">
                      <strong>Action:</strong> {rec.action}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AWS SES Guidance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            AWS SES Compliance
          </CardTitle>
          <CardDescription>
            Current status: {data.aws_guidance.current_status}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium">Bounce Rate Limit</h4>
                <p className="text-sm text-muted-foreground">
                  {data.aws_guidance.bounce_rate_limit}
                </p>
              </div>
              <div>
                <h4 className="font-medium">Complaint Rate Limit</h4>
                <p className="text-sm text-muted-foreground">
                  {data.aws_guidance.complaint_rate_limit}
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Next Steps</h4>
              <ul className="space-y-1">
                {data.aws_guidance.next_steps.map((step, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={fetchReputationData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>
    </div>
  );
}