import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'loopletter-uploads';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for original
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Compression settings
const COMPRESSION_SETTINGS = {
  maxWidth: 800,
  maxHeight: 600,
  quality: 85,
  format: 'jpeg' as const,
};

export async function POST(request: NextRequest) {
  try {
    console.log('Image upload API called');
    
    // Check environment variables
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error('Missing AWS credentials');
      return NextResponse.json(
        { error: 'Server configuration error: Missing AWS credentials' },
        { status: 500 }
      );
    }

    if (!process.env.AWS_S3_BUCKET_NAME) {
      console.error('Missing S3 bucket name');
      return NextResponse.json(
        { error: 'Server configuration error: Missing S3 bucket name' },
        { status: 500 }
      );
    }

    const user = await currentUser();
    if (!user) {
      console.log('User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User authenticated:', user.id);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('File received:', { name: file.name, type: file.type, size: file.size });

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.log('Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.log('File too large:', file.size);
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `email-images/${user.id}/${timestamp}.jpg`; // Always save as JPEG after compression

    console.log('Generated filename:', fileName);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const originalBuffer = Buffer.from(bytes);

    console.log('File converted to buffer, size:', originalBuffer.length);

    // Compress image using Sharp
    let compressedBuffer: Buffer;
    try {
      compressedBuffer = await sharp(originalBuffer)
        .resize(COMPRESSION_SETTINGS.maxWidth, COMPRESSION_SETTINGS.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({
          quality: COMPRESSION_SETTINGS.quality,
          progressive: true,
        })
        .toBuffer();

      console.log('Image compressed:', {
        originalSize: originalBuffer.length,
        compressedSize: compressedBuffer.length,
        compressionRatio: Math.round((1 - compressedBuffer.length / originalBuffer.length) * 100),
      });
    } catch (compressionError) {
      console.error('Image compression failed:', compressionError);
      return NextResponse.json(
        { error: 'Failed to process image. Please ensure it\'s a valid image file.' },
        { status: 400 }
      );
    }

    // Upload compressed image to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: compressedBuffer,
      ContentType: 'image/jpeg',
      CacheControl: 'public, max-age=31536000', // Cache for 1 year
    });

    console.log('Attempting S3 upload to bucket:', BUCKET_NAME);

    await s3Client.send(uploadCommand);

    console.log('S3 upload successful');

    // Generate the public URL
    const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;

    console.log('Generated public URL:', publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      originalFileName: file.name,
      originalSize: file.size,
      compressedSize: compressedBuffer.length,
      compressionRatio: Math.round((1 - compressedBuffer.length / originalBuffer.length) * 100),
    });

  } catch (error) {
    console.error('Upload error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    
    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Upload failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}