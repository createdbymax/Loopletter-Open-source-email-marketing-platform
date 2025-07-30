import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { S3Client, HeadBucketCommand, ListObjectsV2Command, ListBucketsCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'loopletter-uploads';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = {
      environment: {
        AWS_REGION: process.env.AWS_REGION,
        AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? `${process.env.AWS_ACCESS_KEY_ID.substring(0, 8)}...` : 'Missing',
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'Set (hidden)' : 'Missing',
      },
      tests: {} as any
    };

    // Test 0: Test basic AWS credentials by listing buckets
    try {
      const listBucketsCommand = new ListBucketsCommand({});
      const bucketsResponse = await s3Client.send(listBucketsCommand);
      results.tests.credentialsValid = `SUCCESS: Found ${bucketsResponse.Buckets?.length || 0} buckets`;
      
      // Check if target bucket exists
      const targetBucketExists = bucketsResponse.Buckets?.some(bucket => bucket.Name === BUCKET_NAME);
      results.tests.targetBucketExists = targetBucketExists ? 'SUCCESS: Target bucket exists' : 'FAILED: Target bucket does not exist';
      
    } catch (error) {
      results.tests.credentialsValid = `FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`;
      results.tests.targetBucketExists = 'SKIPPED: Could not test due to credential failure';
    }

    // Test 1: Check if bucket exists (only if credentials work)
    if (results.tests.credentialsValid.startsWith('SUCCESS')) {
      try {
        await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
        results.tests.bucketAccessible = 'SUCCESS: Bucket exists and is accessible';
      } catch (error) {
        results.tests.bucketAccessible = `FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }

      // Test 2: Try to list objects (test permissions)
      try {
        const listCommand = new ListObjectsV2Command({
          Bucket: BUCKET_NAME,
          MaxKeys: 1,
        });
        await s3Client.send(listCommand);
        results.tests.listPermission = 'SUCCESS: Can list objects in bucket';
      } catch (error) {
        results.tests.listPermission = `FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    } else {
      results.tests.bucketAccessible = 'SKIPPED: Credentials invalid';
      results.tests.listPermission = 'SKIPPED: Credentials invalid';
    }

    return NextResponse.json(results);

  } catch (error) {
    console.error('S3 test error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}