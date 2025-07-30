// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { S3Client, CreateBucketCommand, PutBucketPolicyCommand, PutBucketCorsCommand } = require('@aws-sdk/client-s3');

// Debug: Check if credentials are loaded
console.log('Environment check:');
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Missing');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Missing');
console.log('AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME);

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error('❌ Missing AWS credentials in environment variables');
  console.error('Make sure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set in .env.local');
  process.exit(1);
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'loopletter-uploads';
const REGION = process.env.AWS_REGION || 'us-east-1';

async function createBucket() {
  try {
    console.log(`Creating S3 bucket: ${BUCKET_NAME}`);

    // Create bucket
    const createCommand = new CreateBucketCommand({
      Bucket: BUCKET_NAME,
      CreateBucketConfiguration: REGION !== 'us-east-1' ? {
        LocationConstraint: REGION,
      } : undefined,
    });

    await s3Client.send(createCommand);
    console.log('✅ Bucket created successfully');

    // Set bucket policy for public read access
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${BUCKET_NAME}/*`,
        },
      ],
    };

    const policyCommand = new PutBucketPolicyCommand({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(bucketPolicy),
    });

    await s3Client.send(policyCommand);
    console.log('✅ Bucket policy set for public read access');

    // Set CORS configuration
    const corsConfiguration = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
          AllowedOrigins: ['*'],
          ExposeHeaders: [],
        },
      ],
    };

    const corsCommand = new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: corsConfiguration,
    });

    await s3Client.send(corsCommand);
    console.log('✅ CORS configuration set');

    console.log(`\n🎉 S3 bucket setup complete!`);
    console.log(`Bucket name: ${BUCKET_NAME}`);
    console.log(`Region: ${REGION}`);
    console.log(`Public URL format: https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/`);

  } catch (error) {
    console.error('❌ Error creating bucket:', error);
    
    if (error.name === 'BucketAlreadyExists') {
      console.log('Bucket already exists. Trying to configure it...');
      // Try to set policy and CORS anyway
      try {
        const bucketPolicy = {
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'PublicReadGetObject',
              Effect: 'Allow',
              Principal: '*',
              Action: 's3:GetObject',
              Resource: `arn:aws:s3:::${BUCKET_NAME}/*`,
            },
          ],
        };

        await s3Client.send(new PutBucketPolicyCommand({
          Bucket: BUCKET_NAME,
          Policy: JSON.stringify(bucketPolicy),
        }));
        console.log('✅ Bucket policy updated');

        const corsConfiguration = {
          CORSRules: [
            {
              AllowedHeaders: ['*'],
              AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
              AllowedOrigins: ['*'],
              ExposeHeaders: [],
            },
          ],
        };

        await s3Client.send(new PutBucketCorsCommand({
          Bucket: BUCKET_NAME,
          CORSConfiguration: corsConfiguration,
        }));
        console.log('✅ CORS configuration updated');

      } catch (configError) {
        console.error('❌ Error configuring existing bucket:', configError);
      }
    }
  }
}

// Check if running directly
if (require.main === module) {
  createBucket();
}

module.exports = { createBucket };