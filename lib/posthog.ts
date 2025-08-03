// This file is deprecated. Use @/lib/analytics instead.
// Keeping for backward compatibility.

import { analytics } from '@/lib/analytics';

// Re-export the unified analytics interface
export { analytics };
export { posthog } from '@/lib/analytics';
export default analytics;