import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import fs from 'fs'
import path from 'path'

const s3Bucket = process.env.S3_BUCKET
const region = process.env.AWS_REGION

let s3: S3Client | null = null
if (s3Bucket && region) {
  s3 = new S3Client({ region })
}

export async function uploadBufferToS3(buffer: Buffer, key: string) {
  if (!s3 || !s3Bucket) throw new Error('S3 not configured')
  const cmd = new PutObjectCommand({ Bucket: s3Bucket, Key: key, Body: buffer })
  await s3.send(cmd)
  return `https://${s3Bucket}.s3.${region}.amazonaws.com/${key}`
}

export function ensurePublicExportsDir() {
  const exportDir = path.join(process.cwd(), 'public', 'exports')
  fs.mkdirSync(exportDir, { recursive: true })
  return exportDir
}
