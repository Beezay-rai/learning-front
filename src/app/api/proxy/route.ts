import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { url, headers, body, method } = await req.json();

  const res = await fetch(url, {
    method: method,
    headers,
    body,
  });

  const text = await res.text();
  console.log("Response from proxy:", text);

  return new NextResponse(text, {
    status: res.status,
  });
}
