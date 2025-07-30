// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

async function testCredentials() {
  console.log('Testing AWS credentials...\n');
  
  // Check environment variables
  console.log('Environment variables:');
  console.log('AWS_REGION:', process.env.AWS_REGION || 'Not set');
  console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? `${process.env.AWS_ACCESS_KEY_ID.substring(0, 8)}...` : 'Not set');
  console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set (hidden)' : 'Not set');
  console.log('AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME || 'Not set');
  console.log('');

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ Missing AWS credentials');
    console.error('Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env.local');
    return;
  }

  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    console.log('Testing S3 connection...');
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    
    console.log('✅ AWS credentials are valid!');
    console.log(`Found ${response.Buckets?.length || 0} buckets in your account:`);
    
    if (response.Buckets && response.Buckets.length > 0) {
      response.Buckets.forEach(bucket => {
        console.log(`  - ${bucket.Name} (created: ${bucket.CreationDate})`);
      });
    }

    // Check if our target bucket exists
    const targetBucket = process.env.AWS_S3_BUCKET_NAME;
    const bucketExists = response.Buckets?.some(bucket => bucket.Name === targetBucket);
    
    console.log('');
    if (bucketExists) {
      console.log(`✅ Target bucket "${targetBucket}" already exists!`);
    } else {
      console.log(`⚠️  Target bucket "${targetBucket}" does not exist.`);
      console.log('You can create it by running: npm run setup-s3');
    }

  } catch (error) {
    console.error('❌ Error testing credentials:', error.message);
    
    if (error.name === 'InvalidAccessKeyId') {
      console.error('The AWS Access Key ID is invalid.');
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.error('The AWS Secret Access Key is invalid.');
    } else if (error.name === 'AccessDenied') {
      console.error('The credentials are valid but lack necessary permissions.');
    } else {
      console.error('Full error:', error);
    }
  }
}

testCredentials();