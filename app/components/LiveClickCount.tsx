"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function LiveClickCount({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const channel = supabaseBrowser()
      .channel("site-click-counter")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "site_click_counter", filter: "id=eq.1" },
        (payload) => {
          const row = payload.new as { total_clicks: number };
          setCount(row.total_clicks);
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser().removeChannel(channel);
    };
  }, []);

  return (
    <span className="inline-flex overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={count}
          initial={{ y: -14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 14, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {count.toLocaleString()}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
