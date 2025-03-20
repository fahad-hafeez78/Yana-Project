// require('dotenv').config();
// const multer = require('multer');
// const { S3Client, PutObjectCommand, DeleteObjectCommand  } = require('@aws-sdk/client-s3');
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import { configDotenv } from 'dotenv';
configDotenv();
const BUCKET_NAME = process.env.BUCKET_NAME;
const REGION = process.env.REGION;
const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_KEY = process.env.SECRET_KEY;


// Set up Multer to store files in memory (buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Initialize S3 Client
const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});

// Function to upload to S3
export const uploadToS3 = async (file, folderName) => {

  const now = new Date();

  // Format the date and time as YYYY-MM-DD_HH-MM-SS
  const formattedDateTime = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

  // Generate a unique file name by combining the formatted date-time and original file name
  const uniqueFileName = `${formattedDateTime}-${file.originalname}`;


  const params = {
    Bucket: BUCKET_NAME,
    Key: `yana-bucket/${folderName}/${uniqueFileName}`, // Consider generating unique names if needed
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${params.Key}`;
  } catch (error) {
    throw new Error('S3 upload failed: ' + error.message);
  }
};

export const deleteFromS3 = async (imageKey) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: imageKey,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(params));
  } catch (error) {
    throw new Error('S3 delete failed: ' + error.message);
  }
};

// Export multer middleware
export const uploadMiddleware = upload.single('imagefile');
