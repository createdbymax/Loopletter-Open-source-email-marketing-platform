import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Artist } from '@/lib/types';
import { FeatureGate, UpgradeButton } from '@/components/ui/feature-access';

interface ScheduleCampaignProps {
  artist: Artist;
  onSchedule: (date: Date) => void;
}

export function ScheduleCampaign({ artist, onSchedule }: ScheduleCampaignProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('12:00');

  const handleSchedule = () => {
    if (!date) return;
    
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledDate = new Date(date);
    scheduledDate.setHours(hours, minutes);
    
    onSchedule(scheduledDate);
  };

  return (
    <FeatureGate 
      feature="emailScheduling" 
      artist={artist}
      fallback={
        <div className="bg-white rounded-lg border p-4 space-y-4">
          <h3 className="font-medium">Schedule Campaign</h3>
          <p className="text-sm text-gray-600">
            Schedule your campaign to send at the perfect time for your audience.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Upgrade to Schedule Campaigns
            </h4>
            <p className="text-xs text-blue-700 mb-3">
              Email scheduling is available on the Independent and Label plans.
            </p>
            <UpgradeButton feature="emailScheduling" />
          </div>
        </div>
      }
    >
      <div className="bg-white rounded-lg border p-4 space-y-4">
        <h3 className="font-medium">Schedule Campaign</h3>
        
        <div className="space-y-3">
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={date ? format(date, 'yyyy-MM-dd') : ''}
              onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : undefined)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label>Time</Label>
            <div className="flex items-center mt-1">
              <Clock className="mr-2 h-4 w-4 text-gray-500" />
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
          
          <Button onClick={handleSchedule} className="w-full">
            Schedule Campaign
          </Button>
        </div>
      </div>
    </FeatureGate>
  );
}