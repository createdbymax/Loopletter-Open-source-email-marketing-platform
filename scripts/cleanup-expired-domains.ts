#!/usr/bin/env tsx
/**
 * Cleanup script for expired domain claims
 * Run this periodically (e.g., daily via cron) to clean up domains
 * that were claimed but not verified within 7 days
 */

import { cleanupExpiredDomainClaims } from '../lib/domain-ownership-verification';

async function main() {
  console.log('Starting cleanup of expired domain claims...');
  
  try {
    await cleanupExpiredDomainClaims();
    console.log('✅ Cleanup completed successfully');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}

export { main as cleanupExpiredDomains };