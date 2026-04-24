import { NextResponse } from "next/server";

const RESUME_PATH = "/files/OmkarArora_Resume.pdf";

export function GET(request: Request) {
  return NextResponse.redirect(new URL(RESUME_PATH, request.url));
}
