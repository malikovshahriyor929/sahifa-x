import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Registration is disabled in frontend-only mode." },
    { status: 410 }
  );
}
