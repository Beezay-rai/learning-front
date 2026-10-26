"use client";

import { useParams } from "next/navigation";
import ScopeEditor from "../../ScopeEditor";

export default function EditApiScopePage() {
  const params = useParams<{ id: string }>();
  return <ScopeEditor id={Number(params.id)} />;
}
