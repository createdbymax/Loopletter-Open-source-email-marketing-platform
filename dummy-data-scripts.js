// Console Scripts for Adding Dummy Data to Loopletter Dashboard
// Copy and paste these scripts into Chrome DevTools Console

// ============================================================================
// SCRIPT 1: DASHBOARD OVERVIEW PAGE DUMMY DATA
// ============================================================================

function addOverviewDummyData() {
  console.log('🎵 Adding dummy data to Dashboard Overview...');
  
  try {
    // Find and update the key metric numbers using the exact class pattern from the component
    const metricNumbers = document.querySelectorAll('p.mt-2.text-3xl.font-bold.text-gray-900');
    
    if (metricNumbers.length >= 4) {
      // Total Campaigns
      metricNumbers[0].textContent = '12';
      
      // Total Fans  
      metricNumbers[1].textContent = '2,847';
      
      // Open Rate
      metricNumbers[2].textContent = '37.9%';
      
      // This Month
      metricNumbers[3].textContent = '5';
      
      console.log('✅ Updated metric numbers');
    }
    
    // Update the subtext under metrics
    const subtexts = document.querySelectorAll('p.text-sm.text-gray-600.mt-1');
    if (subtexts.length >= 4) {
      subtexts[0].textContent = '2 drafts, 10 sent';
      subtexts[1].textContent = 'Active subscribers';
      subtexts[2].textContent = 'Average across campaigns';
      subtexts[3].textContent = 'Campaigns created';
    }
    
    // Update usage bars and percentages
    const usageBars = document.querySelectorAll('.h-2.bg-gray-100.rounded-full.overflow-hidden');
    if (usageBars.length >= 2) {
      // Subscriber usage bar (97% - approaching limit)
      const subscriberBar = usageBars[0].querySelector('.h-full');
      if (subscriberBar) {
        subscriberBar.style.width = '97%';
        subscriberBar.className = subscriberBar.className.replace('bg-blue-600', 'bg-amber-500');
      }
      
      // Email usage bar (45%)
      const emailBar = usageBars[1].querySelector('.h-full');
      if (emailBar) {
        emailBar.style.width = '45%';
      }
    }
    
    // Update usage text numbers
    const usageTexts = document.querySelectorAll('.text-sm.font-medium');
    usageTexts.forEach(text => {
      if (text.textContent && text.textContent.includes('/')) {
        if (text.textContent.includes('0 /') || text.textContent.includes('/ 3,000')) {
          text.textContent = '2,847 / 3,000';
        } else if (text.textContent.includes('Unlimited')) {
          text.textContent = '8,237 / Unlimited';
        }
      }
    });
    
    // Show the approaching limit warning
    const warningElements = document.querySelectorAll('.text-amber-600');
    warningElements.forEach(warning => {
      if (warning.textContent && warning.textContent.includes('approaching')) {
        warning.style.display = 'flex';
        warning.parentElement.style.display = 'block';
      }
    });
    
    // Create dummy campaigns for the recent campaigns section
    const dummyCampaigns = [
      {
        title: 'New Album "Midnight Dreams" Out Now!',
        status: 'sent',
        date: '12/15/2024',
        statusColor: 'bg-green-500',
        statusBg: 'bg-green-100 text-green-800'
      },
      {
        title: 'Behind the Scenes: Studio Sessions',
        status: 'sent', 
        date: '12/10/2024',
        statusColor: 'bg-green-500',
        statusBg: 'bg-green-100 text-green-800'
      },
      {
        title: 'Live Show Announcement - NYC',
        status: 'sent',
        date: '12/5/2024', 
        statusColor: 'bg-green-500',
        statusBg: 'bg-green-100 text-green-800'
      },
      {
        title: 'Holiday Special: Acoustic Sessions',
        status: 'draft',
        date: '12/16/2024',
        statusColor: 'bg-gray-400',
        statusBg: 'bg-gray-100 text-gray-800'
      },
      {
        title: 'Year End Thank You Message',
        status: 'scheduled',
        date: '12/31/2024',
        statusColor: 'bg-blue-500', 
        statusBg: 'bg-blue-100 text-blue-800'
      }
    ];
    
    // Find the recent campaigns container
    const campaignsContainer = document.querySelector('.space-y-4');
    if (campaignsContainer) {
      // Clear existing content
      campaignsContainer.innerHTML = '';
      
      // Add dummy campaigns
      dummyCampaigns.forEach(campaign => {
        const campaignElement = document.createElement('div');
        campaignElement.className = 'flex items-center justify-between p-4 border rounded-lg';
        
        campaignElement.innerHTML = `
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full mr-3 ${campaign.statusColor}"></div>
            <div>
              <h4 class="font-medium">${campaign.title}</h4>
              <p class="text-sm text-gray-600">
                ${campaign.status === 'sent' ? 'Sent' : 'Created'} ${campaign.date}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${campaign.statusBg}">
              ${campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </span>
            <button class="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </button>
          </div>
        `;
        
        campaignsContainer.appendChild(campaignElement);
      });
      
      console.log('✅ Added recent campaigns');
    }
    
    // Hide the "Getting Started" section if it exists
    const gettingStarted = document.querySelector('.bg-gradient-to-r.from-blue-50.to-purple-50');
    if (gettingStarted) {
      gettingStarted.style.display = 'none';
    }
    
    // Hide the "No campaigns yet" message if it exists
    const noCampaignsMessage = document.querySelector('.text-center.py-8');
    if (noCampaignsMessage) {
      noCampaignsMessage.style.display = 'none';
    }
    
    console.log('✅ Dashboard Overview dummy data added successfully!');
    console.log('📊 Stats: 12 campaigns, 2,847 fans, 37.9% open rate');
    
  } catch (error) {
    console.error('❌ Error adding dummy data:', error);
    console.log('Available elements:', {
      metricNumbers: document.querySelectorAll('p.mt-2.text-3xl.font-bold.text-gray-900').length,
      usageBars: document.querySelectorAll('.h-2.bg-gray-100.rounded-full.overflow-hidden').length,
      campaignsContainer: !!document.querySelector('.space-y-4')
    });
  }
}

// ============================================================================
// SCRIPT 2: ANALYTICS PAGE DUMMY DATA  
// ============================================================================

function addAnalyticsDummyData() {
  console.log('📈 Adding dummy data to Analytics Dashboard...');
  
  try {
    // Find and update the key metric cards
    const metricCards = document.querySelectorAll('.text-2xl.font-bold');
    
    if (metricCards.length >= 4) {
      // Open Rate
      metricCards[0].textContent = '37.9%';
      
      // Click Rate  
      metricCards[1].textContent = '8.6%';
      
      // Total Subscribers
      metricCards[2].textContent = '2,847';
      
      // Total Campaigns
      metricCards[3].textContent = '12';
      
      console.log('✅ Updated analytics metrics');
    }
    
    // Update trend indicators to show positive trends
    const trendElements = document.querySelectorAll('.text-muted-foreground');
    trendElements.forEach(element => {
      if (element.textContent && element.textContent.includes('industry average')) {
        element.innerHTML = `
          <span class="text-green-600 flex items-center">
            <svg class="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
            Above industry average
          </span>
        `;
      } else if (element.textContent && element.textContent.includes('new this month')) {
        element.innerHTML = `
          <span class="text-green-600 flex items-center">
            <svg class="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
            234 new this month
          </span>
        `;
      } else if (element.textContent && element.textContent.includes('emails sent')) {
        element.textContent = '28,547 emails sent';
      }
    });
    
    // Update campaign performance data in the overview section
    const campaignPerformanceData = [
      {
        title: 'New Album "Midnight Dreams" Out Now!',
        date: 'Dec 15, 2024',
        sent: '2,847',
        openRate: 34,
        clickRate: 8.2
      },
      {
        title: 'Behind the Scenes: Studio Sessions',
        date: 'Dec 10, 2024', 
        sent: '2,756',
        openRate: 41,
        clickRate: 12
      },
      {
        title: 'Live Show Announcement - NYC',
        date: 'Dec 5, 2024',
        sent: '2,634',
        openRate: 38,
        clickRate: 15
      },
      {
        title: 'Holiday Merch Drop',
        date: 'Nov 28, 2024',
        sent: '2,598',
        openRate: 33,
        clickRate: 7.3
      },
      {
        title: 'Thanksgiving Message',
        date: 'Nov 25, 2024',
        sent: '2,587',
        openRate: 40,
        clickRate: 6.0
      }
    ];
    
    // Update campaign performance section
    const campaignSections = document.querySelectorAll('.space-y-8 > div');
    campaignSections.forEach((section, index) => {
      if (index < campaignPerformanceData.length) {
        const campaign = campaignPerformanceData[index];
        
        const title = section.querySelector('h4');
        const date = section.querySelector('.text-sm.text-gray-500');
        const sent = section.querySelector('.font-medium');
        const openRate = section.querySelector('.text-sm.text-gray-500:last-child');
        
        if (title) title.textContent = campaign.title;
        if (date) date.textContent = `Sent ${campaign.date}`;
        if (sent) sent.textContent = `${campaign.sent} sent`;
        if (openRate) openRate.textContent = `${campaign.openRate}% open rate`;
        
        // Update progress bars
        const progressBars = section.querySelectorAll('.h-1\\.5 .h-full, .h-1 .h-full');
        if (progressBars.length >= 2) {
          progressBars[0].style.width = `${campaign.openRate}%`;
          progressBars[1].style.width = `${campaign.clickRate}%`;
        }
        
        // Update stats text
        const statsText = section.querySelectorAll('.text-xs');
        statsText.forEach(stat => {
          if (stat.textContent && stat.textContent.includes('Opens')) {
            const opens = Math.round((parseInt(campaign.sent.replace(',', '')) * campaign.openRate) / 100);
            stat.textContent = `${opens.toLocaleString()} (${campaign.openRate}%)`;
          } else if (stat.textContent && stat.textContent.includes('Clicks')) {
            const clicks = Math.round((parseInt(campaign.sent.replace(',', '')) * campaign.clickRate) / 100);
            stat.textContent = `${clicks.toLocaleString()} (${campaign.clickRate}%)`;
          }
        });
      }
    });
    
    // Update campaign table if it exists
    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach((row, index) => {
      if (index < campaignPerformanceData.length) {
        const campaign = campaignPerformanceData[index];
        const cells = row.querySelectorAll('td');
        
        if (cells.length >= 7) {
          cells[0].textContent = campaign.title;
          cells[1].textContent = campaign.date;
          cells[2].textContent = campaign.sent;
          
          const opens = Math.round((parseInt(campaign.sent.replace(',', '')) * campaign.openRate) / 100);
          const clicks = Math.round((parseInt(campaign.sent.replace(',', '')) * campaign.clickRate) / 100);
          
          cells[3].textContent = opens.toLocaleString();
          cells[4].textContent = clicks.toLocaleString();
          cells[5].textContent = `${campaign.openRate}%`;
          cells[6].textContent = `${campaign.clickRate}%`;
        }
      }
    });
    
    console.log('✅ Analytics Dashboard dummy data added successfully!');
    console.log('📊 Analytics: 12 campaigns, 37.9% avg open rate, 8.6% avg click rate');
    
  } catch (error) {
    console.error('❌ Error adding analytics dummy data:', error);
    console.log('Available elements:', {
      metricCards: document.querySelectorAll('.text-2xl.font-bold').length,
      campaignSections: document.querySelectorAll('.space-y-8 > div').length,
      tableRows: document.querySelectorAll('tbody tr').length
    });
  }
}

// ============================================================================
// ALTERNATIVE APPROACH: DIRECT DOM MANIPULATION
// ============================================================================

function addOverviewDummyDataAlt() {
  console.log('🎵 Alternative approach for Dashboard Overview...');
  
  // More aggressive DOM targeting
  const allNumbers = document.querySelectorAll('*');
  const numberElements = [];
  
  allNumbers.forEach(el => {
    if (el.textContent && el.textContent.match(/^\d+$/) && el.classList.contains('text-3xl')) {
      numberElements.push(el);
    }
  });
  
  console.log('Found number elements:', numberElements.length);
  
  // Try to update any element that looks like a metric
  document.querySelectorAll('*').forEach(el => {
    if (el.textContent === '0' && el.classList.contains('font-bold')) {
      if (el.parentElement && el.parentElement.textContent.includes('Campaign')) {
        el.textContent = '12';
      } else if (el.parentElement && el.parentElement.textContent.includes('Fan')) {
        el.textContent = '2,847';
      }
    }
  });
}

// ============================================================================
// USAGE INSTRUCTIONS
// ============================================================================

console.log(`
🎵 Loopletter Dummy Data Scripts Ready!

USAGE:
1. Navigate to the Dashboard Overview page (/dashboard)
2. Run: addOverviewDummyData()

3. Navigate to the Analytics page (/dashboard/analytics)
4. Run: addAnalyticsDummyData()

If the main scripts don't work, try:
- addOverviewDummyDataAlt() for alternative approach

These scripts will populate the pages with realistic dummy data for screenshots.
`);

// Export functions to global scope
window.addOverviewDummyData = addOverviewDummyData;
window.addAnalyticsDummyData = addAnalyticsDummyData;
window.addOverviewDummyDataAlt = addOverviewDummyDataAlt;