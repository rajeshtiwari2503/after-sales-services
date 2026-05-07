import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,

  credentials: {
    accessKeyId:
      process.env.AWS_ACCESS_KEY_ID!,

    secretAccessKey:
      process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadFileToS3(
  file: Buffer,
  fileName: string
) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: file,
  });

  await s3.send(command);

  return `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
}