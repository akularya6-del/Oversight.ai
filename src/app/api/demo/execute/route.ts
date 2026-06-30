import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Simulate execution delay
  await new Promise(r => setTimeout(r, 800));

  return NextResponse.json({
    success: true,
    message: "Action simulated in Demo Mode."
  });
}
