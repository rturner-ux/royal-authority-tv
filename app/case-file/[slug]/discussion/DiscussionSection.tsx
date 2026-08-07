"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import CaseReactionBar from "../../../components/CaseReactionBar";
import CaseComments from "../../../components/CaseComments";

export default function DiscussionSection({
  incidentId,
  initialShareCount,
  isSignedIn,
}: {
  incidentId: string;
  initialShareCount: number;
  isSignedIn: boolean;
}) {
  const pathname = usePathname();
  const [commentCount, setCommentCount] = useState(0);

  return (
    <>
      <CaseReactionBar
        incidentId={incidentId}
        discussionHref={pathname}
        commentCount={commentCount}
        initialShareCount={initialShareCount}
        isSignedIn={isSignedIn}
      />
      <CaseComments incidentId={incidentId} isSignedIn={isSignedIn} onTotalChange={setCommentCount} />
    </>
  );
}
