import {
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import{s3} from "@/lib/s3"
 

import { NextResponse } from "next/server";

export async function POST(
  req: Request
) {
  try {
    const formData =
      await req.formData();

    const file = formData.get(
      "file"
    ) as File;

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    const fileName =
      `${Date.now()}-${file.name}`;

    await s3.send(
      new PutObjectCommand({
        Bucket:
          process.env
            .AWS_BUCKET_NAME,

        Key: fileName,

        Body: buffer,

        ContentType: file.type,
      })
    );

    const url = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;

    return NextResponse.json({
      success: true,
      url,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}