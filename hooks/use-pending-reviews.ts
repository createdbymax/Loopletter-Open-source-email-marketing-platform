'use client';

import { useState, useEffect } from 'react';

interface ReviewStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export function usePendingReviews(pollInterval: number = 30000) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/reviews?include_stats=true');
      
      if (!response.ok) {
        throw new Error('Failed to fetch review stats');
      }
      
      const data = await response.json();
      setStats(data.stats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Set up polling if interval is provided
    if (pollInterval > 0) {
      const interval = setInterval(fetchStats, pollInterval);
      return () => clearInterval(interval);
    }
  }, [pollInterval]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
    hasPendingReviews: (stats?.pending || 0) > 0
  };
}