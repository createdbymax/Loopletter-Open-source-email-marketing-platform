'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, Eye, ThumbsUp, ThumbsDown, RefreshCw, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
interface ReviewData {
    id: string;
    email: string;
    name?: string;
    risk_score: number;
    flags: string[];
    recommendations: string[];
    review_type: 'spam_detection' | 'manual_flag' | 'bulk_import';
    auto_flagged_at: string;
    original_data: any;
    quarantine_summary: {
        primary_concerns: string[];
        risk_level: 'low' | 'medium' | 'high';
        source: string;
    };
}
interface ReviewStats {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
}
interface UserInfo {
    role: string;
    can_approve: boolean;
    can_reject: boolean;
}
export function AdminReviewDashboard() {
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedReview, setSelectedReview] = useState<ReviewData | null>(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [processingReview, setProcessingReview] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRisk, setFilterRisk] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/reviews?include_stats=true');
            if (!response.ok) {
                throw new Error('Failed to fetch reviews');
            }
            const result = await response.json();
            setReviews(result.reviews || []);
            setStats(result.stats);
            setUserInfo(result.user_info);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchReviews();
    }, []);
    const handleApprove = async (reviewId: string) => {
        try {
            setProcessingReview(reviewId);
            const response = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: reviewNotes })
            });
            if (!response.ok) {
                throw new Error('Failed to approve fan');
            }
            await fetchReviews();
            setSelectedReview(null);
            setReviewNotes('');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to approve fan');
        }
        finally {
            setProcessingReview(null);
        }
    };
    const handleReject = async (reviewId: string) => {
        try {
            setProcessingReview(reviewId);
            const response = await fetch(`/api/admin/reviews/${reviewId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: reviewNotes })
            });
            if (!response.ok) {
                throw new Error('Failed to reject fan');
            }
            await fetchReviews();
            setSelectedReview(null);
            setReviewNotes('');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reject fan');
        }
        finally {
            setProcessingReview(null);
        }
    };
    const getRiskColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'spam_detection': return <Shield className="h-4 w-4"/>;
            case 'bulk_import': return <AlertTriangle className="h-4 w-4"/>;
            case 'manual_flag': return <Eye className="h-4 w-4"/>;
            default: return <Clock className="h-4 w-4"/>;
        }
    };
    const filteredReviews = reviews.filter(review => {
        const matchesSearch = !searchTerm ||
            review.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (review.name && review.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRisk = filterRisk === 'all' || review.quarantine_summary.risk_level === filterRisk;
        const matchesType = filterType === 'all' || review.review_type === filterType;
        return matchesSearch && matchesRisk && matchesType;
    });
    if (loading) {
        return (<div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2"/>
        Loading reviews...
      </div>);
    }
    if (error) {
        return (<Alert>
        <AlertTriangle className="h-4 w-4"/>
        <AlertDescription>
          Error loading reviews: {error}
          <Button variant="outline" size="sm" onClick={fetchReviews} className="ml-2">
            Retry
          </Button>
        </AlertDescription>
      </Alert>);
    }
    return (<div className="space-y-6">
      
      {userInfo && (<Alert>
          <Shield className="h-4 w-4"/>
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>Your role:</span>
                <Badge variant="outline">
                  {userInfo.role.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {userInfo.can_approve && userInfo.can_reject
                ? '(Can approve and reject contacts)'
                : '(View-only access)'}
                </span>
              </div>
            </div>
          </AlertDescription>
        </Alert>)}

      
      {stats && (<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500"/>
                <span className="text-2xl font-bold">{stats.pending}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500"/>
                <span className="text-2xl font-bold">{stats.approved}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500"/>
                <span className="text-2xl font-bold">{stats.rejected}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500"/>
                <span className="text-2xl font-bold">{stats.total}</span>
              </div>
            </CardContent>
          </Card>
        </div>)}

      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5"/>
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                <Input id="search" placeholder="Search by email or name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8"/>
              </div>
            </div>

            <div>
              <Label htmlFor="risk-filter">Risk Level</Label>
              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger>
                  <SelectValue placeholder="All risk levels"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type-filter">Review Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="spam_detection">Spam Detection</SelectItem>
                  <SelectItem value="bulk_import">Bulk Import</SelectItem>
                  <SelectItem value="manual_flag">Manual Flag</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={fetchReviews} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2"/>
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Reviews ({filteredReviews.length})</CardTitle>
            <CardDescription>
              Contacts flagged for manual review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredReviews.length === 0 ? (<div className="text-center py-8 text-muted-foreground">
                  {reviews.length === 0 ? 'No pending reviews' : 'No reviews match your filters'}
                </div>) : (filteredReviews.map((review) => (<div key={review.id} className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedReview?.id === review.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`} onClick={() => setSelectedReview(review)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{review.email}</span>
                          {review.name && (<span className="text-sm text-muted-foreground">({review.name})</span>)}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getRiskColor(review.quarantine_summary.risk_level)} text-white`}>
                            {review.quarantine_summary.risk_level.toUpperCase()} RISK
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getTypeIcon(review.review_type)}
                            {review.review_type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Score: {review.risk_score}
                          </span>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Primary concerns: {review.quarantine_summary.primary_concerns.join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>)))}
            </div>
          </CardContent>
        </Card>

        
        <Card>
          <CardHeader>
            <CardTitle>Review Details</CardTitle>
            <CardDescription>
              {selectedReview ? 'Review and approve/reject this contact' : 'Select a review to see details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedReview ? (<div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Email:</strong> {selectedReview.email}</div>
                    {selectedReview.name && <div><strong>Name:</strong> {selectedReview.name}</div>}
                    <div><strong>Source:</strong> {selectedReview.quarantine_summary.source}</div>
                    <div><strong>Flagged:</strong> {new Date(selectedReview.auto_flagged_at).toLocaleString()}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Risk Assessment</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Risk Score:</span>
                      <Badge className={`${getRiskColor(selectedReview.quarantine_summary.risk_level)} text-white`}>
                        {selectedReview.risk_score}/100
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Flags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedReview.flags.map((flag, index) => (<Badge key={index} variant="outline" className="text-xs">
                            {flag.replace('_', ' ')}
                          </Badge>))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="text-sm space-y-1">
                    {selectedReview.recommendations.map((rec, index) => (<li key={index} className="flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        {rec}
                      </li>))}
                  </ul>
                </div>

                <div>
                  <Label htmlFor="review-notes">Review Notes (Optional)</Label>
                  <Textarea id="review-notes" placeholder="Add notes about your decision..." value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} className="mt-1"/>
                </div>

                <div className="flex gap-3">
                  {userInfo?.can_approve ? (<Button onClick={() => handleApprove(selectedReview.id)} disabled={processingReview === selectedReview.id} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                      <ThumbsUp className="h-4 w-4"/>
                      {processingReview === selectedReview.id ? 'Approving...' : 'Approve'}
                    </Button>) : (<div className="text-sm text-muted-foreground">
                      Only admins and owners can approve contacts
                    </div>)}
                  
                  {userInfo?.can_reject ? (<Button onClick={() => handleReject(selectedReview.id)} disabled={processingReview === selectedReview.id} variant="destructive" className="flex items-center gap-2">
                      <ThumbsDown className="h-4 w-4"/>
                      {processingReview === selectedReview.id ? 'Rejecting...' : 'Reject'}
                    </Button>) : (<div className="text-sm text-muted-foreground">
                      Only admins and owners can reject contacts
                    </div>)}
                </div>
              </div>) : (<div className="text-center py-8 text-muted-foreground">
                Select a review from the list to see details and take action
              </div>)}
          </CardContent>
        </Card>
      </div>
    </div>);
}
