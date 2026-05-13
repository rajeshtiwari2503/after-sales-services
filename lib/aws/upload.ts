import { uploadToS3 } from '../s3';
import crypto from 'crypto';

export interface UploadResult {
  url: string;
  key: string;
  filename: string;
  contentType: string;
  size: number;
}

export async function uploadFile(
  file: File,
  tenantId: string,
  folder = 'uploads'
): Promise<UploadResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const hash = crypto.randomBytes(8).toString('hex');
  const extension = file.name.split('.').pop() || '';
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${tenantId}/${folder}/${hash}-${sanitizedName}`;

  const url = await uploadToS3(key, buffer, file.type);

  return {
    url,
    key,
    filename: file.name,
    contentType: file.type,
    size: file.size,
  };
}

export async function uploadBuffer(
  buffer: Buffer,
  filename: string,
  contentType: string,
  tenantId: string,
  folder = 'uploads'
): Promise<UploadResult> {
  const hash = crypto.randomBytes(8).toString('hex');
  const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${tenantId}/${folder}/${hash}-${sanitizedName}`;

  const url = await uploadToS3(key, buffer, contentType);

  return {
    url,
    key,
    filename,
    contentType,
    size: buffer.length,
  };
}
