import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { url, headers, body, method } = await req.json();
  console.log(body, "Proxying request to:", url);

  let requestBody = body;
  let requestHeaders = headers;

  if (body?.type === "multipart") {
    const formData = new FormData();

    for (const field of body.fields) {
      if (field.file) {
        const bytes = Uint8Array.from(atob(field.file.base64), (char) =>
          char.charCodeAt(0),
        );
        formData.append(
          field.name,
          new Blob([bytes], { type: field.file.type || "application/octet-stream" }),
          field.file.name,
        );
      } else {
        formData.append(field.name, field.value);
      }
    }

    requestBody = formData;
    requestHeaders = Object.fromEntries(
      Object.entries(headers as Record<string, string>).filter(
        ([key]) => key.toLowerCase() !== "content-type",
      ),
    );
  }

  const res = await fetch(url, {
    method: method,
    headers: requestHeaders,
    body: requestBody,
  });

  const text = await res.text();
  console.log("Response from proxy:", text);

  return new NextResponse(text, {
    status: res.status,
  });
}
