const moment = require("moment-timezone");
const config = require('../config/config');
const { S3Client, PutObjectCommand, DeleteObjectCommand  } = require('@aws-sdk/client-s3');

const BUCKET_NAME = config.s3.bucket_name;
const REGION = config.s3.bucket_region;
const ACCESS_KEY = config.s3.bucket_accesskey;
const SECRET_KEY = config.s3.bucket_secretkey;
  
// Initialize S3 Client
const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});
 
// upload to S3
const uploadToS3 = async (file, folderName) => { 
  const now = moment().tz("America/New_York");

  const formattedDateTime = now.format('YYYY-MM-DD_HH-mm-ss');
  
  const safeOriginalName = file.originalname.replace(/\s+/g, '_');
  const uniqueFileName = `${formattedDateTime}-${safeOriginalName}`;
 
  const key = `yana-bucket/${folderName}/${uniqueFileName}`;
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
  } catch (error) {
    throw new Error('S3 upload failed: ' + error.message);
  }
};

// delete from S3
const deleteFromS3 = async (imageKey) => {
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
 

module.exports = { 
  uploadToS3,
  deleteFromS3,
};
