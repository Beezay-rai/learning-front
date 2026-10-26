"use client";

import { useParams } from "next/navigation";
import ClientEditor from "../../ClientEditor";

export default function EditIdentityClientPage() {
  const params = useParams<{ id: string }>();
  return <ClientEditor id={Number(params.id)} />;
}
