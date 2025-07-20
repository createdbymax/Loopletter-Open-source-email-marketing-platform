// This is a simple script to run the TypeScript file using ts-node
// You can run this script with: node scripts/update-subscription.js

const { execSync } = require('child_process');

try {
  console.log('Running update-subscription.ts...');
  execSync('npx ts-node scripts/update-subscription.ts', { stdio: 'inherit' });
  console.log('Script completed successfully!');
} catch (error) {
  console.error('Error running script:', error);
}