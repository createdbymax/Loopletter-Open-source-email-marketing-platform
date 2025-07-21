// Loopletter Dashboard Mockup Data Generator
// This script adds realistic data to your existing dashboard for screenshots
console.log('🎵 Loopletter Mockup Data Generator Starting...');

// Mockup data that matches your dashboard structure
const mockupData = {
  campaigns: [
    {
      title: '🎵 New Single "Midnight Dreams" is Live!',
      status: 'sent',
      date: '2024-01-15',
      recipients: 2847,
      openRate: '68.5%'
    },
    {
      title: '🎤 Behind the Scenes: Studio Sessions',
      status: 'sent', 
      date: '2024-01-10',
      recipients: 2847,
      openRate: '74.2%'
    },
    {
      title: '🎪 Tour Announcement - Coming to Your City!',
      status: 'sent',
      date: '2024-01-05', 
      recipients: 2847,
      openRate: '82.1%'
    },
    {
      title: '📧 Weekly Newsletter #12',
      status: 'draft',
      date: '2024-01-20',
      recipients: 0,
      openRate: '--'
    },
    {
      title: '🎁 Exclusive Merch Drop Preview',
      status: 'scheduled',
      date: '2024-01-25',
      recipients: 2847,
      openRate: '--'
    }
  ],
  fans: [
    { name: 'Emma Johnson', email: 'emma.j@email.com', location: 'Los Angeles, CA' },
    { name: 'Marcus Rodriguez', email: 'm.rodriguez@email.com', location: 'Austin, TX' },
    { name: 'Sarah Kim', email: 'sarah.kim@email.com', location: 'Seattle, WA' },
    { name: 'Alex Chen', email: 'alex.chen@email.com', location: 'New York, NY' },
    { name: 'Jordan Taylor', email: 'j.taylor@email.com', location: 'Nashville, TN' }
  ]
};

// Add mockup indicator
function addMockupIndicator() {
  // Remove existing indicator if present
  const existing = document.querySelector('.mockup-indicator');
  if (existing) existing.remove();

  const indicator = document.createElement('div');
  indicator.className = 'mockup-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-family: system-ui, -apple-system, sans-serif;
  `;
  indicator.textContent = '📸 Mockup Data Active';
  document.body.appendChild(indicator);
}

// Update dashboard metrics
function updateMetrics() {
  // Find metric cards and update them
  const metricCards = document.querySelectorAll('.bg-white.p-6.rounded-lg.border');
  
  metricCards.forEach((card, index) => {
    const numberElement = card.querySelector('.text-3xl.font-bold');
    if (!numberElement) return;

    switch(index) {
      case 0: // Total Campaigns
        numberElement.textContent = mockupData.campaigns.length.toString();
        const campaignSubtext = card.querySelector('.text-sm.text-gray-600');
        if (campaignSubtext) {
          const drafts = mockupData.campaigns.filter(c => c.status === 'draft').length;
          const sent = mockupData.campaigns.filter(c => c.status === 'sent').length;
          campaignSubtext.textContent = `${drafts} drafts, ${sent} sent`;
        }
        break;
      case 1: // Total Fans
        numberElement.textContent = mockupData.fans.length.toString();
        break;
      case 2: // Open Rate
        numberElement.textContent = '71.2%';
        const openRateSubtext = card.querySelector('.text-sm.text-gray-600');
        if (openRateSubtext) {
          openRateSubtext.textContent = 'Average across all campaigns';
        }
        break;
      case 3: // This Month
        numberElement.textContent = '3';
        break;
    }
  });
}

// Hide empty states and add campaign data
function updateCampaignsList() {
  // Hide "No campaigns yet" empty state
  const emptyState = document.querySelector('.text-center.py-8');
  if (emptyState && emptyState.textContent.includes('No campaigns yet')) {
    emptyState.style.display = 'none';
    
    // Find the campaigns container
    const campaignsContainer = emptyState.parentElement;
    if (campaignsContainer) {
      // Create campaigns list
      const campaignsList = document.createElement('div');
      campaignsList.className = 'space-y-4';
      
      mockupData.campaigns.slice(0, 5).forEach(campaign => {
        const campaignElement = document.createElement('div');
        campaignElement.className = 'flex items-center justify-between p-4 border rounded-lg';
        
        const statusColor = campaign.status === 'sent' ? 'bg-green-500' :
                           campaign.status === 'scheduled' ? 'bg-blue-500' : 'bg-gray-400';
        
        const statusBadgeColor = campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                                campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800';
        
        campaignElement.innerHTML = `
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full mr-3 ${statusColor}"></div>
            <div>
              <h4 class="font-medium">${campaign.title}</h4>
              <p class="text-sm text-gray-600">
                ${campaign.status === 'sent' ? 'Sent' : 'Created'} ${campaign.date}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeColor}">
              ${campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </span>
            <button class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </button>
          </div>
        `;
        
        campaignsList.appendChild(campaignElement);
      });
      
      campaignsContainer.appendChild(campaignsList);
    }
  }
}

// Hide getting started section
function hideGettingStarted() {
  const gettingStarted = document.querySelector('.bg-gradient-to-r.from-blue-50.to-purple-50');
  if (gettingStarted) {
    gettingStarted.style.display = 'none';
  }
}

// Main update function
function updateDashboard() {
  console.log('🔄 Updating dashboard with mockup data...');
  
  updateMetrics();
  updateCampaignsList();
  hideGettingStarted();
  
  console.log('✅ Dashboard updated with realistic mockup data!');
  console.log(`📊 Added ${mockupData.campaigns.length} campaigns and ${mockupData.fans.length} fans`);
}

// Initialize
addMockupIndicator();

// Wait for React to render, then update
setTimeout(() => {
  updateDashboard();
}, 1000);

// Make available globally for manual updates
window.LoopLetterMockup = {
  update: updateDashboard,
  data: mockupData,
  refresh: () => {
    setTimeout(updateDashboard, 500);
  }
};

console.log('📸 Loopletter mockup ready! Use LoopLetterMockup.refresh() if data doesn\'t appear.');