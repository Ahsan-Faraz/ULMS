import { getUploadAuthParams } from "@imagekit/next/server";
import config from "@/lib/config";
import { NextResponse } from "next/server";

export async function GET() {
  const {
    env: {
      imagekit: { publicKey, privateKey },
    },
  } = config;

  const { token, expire, signature } = getUploadAuthParams({
    privateKey,
    publicKey,
  });

  return NextResponse.json({ token, expire, signature, publicKey });
}
