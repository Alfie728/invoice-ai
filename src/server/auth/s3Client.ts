import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@/env";

export const s3Client = new S3Client({
  region: env.BUCKET_REGION,
  credentials: {
    accessKeyId: env.BUCKET_ACCESS_KEY,
    secretAccessKey: env.BUCKET_SECRET_ACCESS_KEY,
  },
});
