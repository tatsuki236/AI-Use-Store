"use client";

import { useEffect, useRef } from "react";
import { recordView } from "./actions";

export function RecordView({ articleId }: { articleId: string }) {
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    recordView(articleId).catch(() => {});
  }, [articleId]);

  return null;
}
