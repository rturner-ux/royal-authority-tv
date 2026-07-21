"use client";

import { useEffect } from "react";

export const LAST_CASE_KEY = "ra-last-case";

export default function RecordLastCase({ slug, title }: { slug: string; title: string }) {
  useEffect(() => {
    localStorage.setItem(LAST_CASE_KEY, JSON.stringify({ slug, title, viewedAt: Date.now() }));
  }, [slug, title]);

  return null;
}
