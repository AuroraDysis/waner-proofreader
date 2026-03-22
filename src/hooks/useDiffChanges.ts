import { useMemo, useCallback } from "react";
import {
  computeWordDiff,
  groupDiffSegments,
  diffStats,
  changeCount,
  applyDiffAction,
  applyAllActions,
} from "@/lib/diff-utils";

interface UseDiffChangesOptions {
  originalText: string;
  modifiedText: string;
  setOriginalText: (text: string) => void;
  setModifiedText: (text: string) => void;
}

export function useDiffChanges({
  originalText,
  modifiedText,
  setOriginalText,
  setModifiedText,
}: UseDiffChangesOptions) {
  const segments = useMemo(
    () => computeWordDiff(originalText, modifiedText),
    [originalText, modifiedText]
  );

  const changes = useMemo(() => groupDiffSegments(segments), [segments]);

  const stats = useMemo(() => diffStats(segments), [segments]);

  const numChanges = useMemo(() => changeCount(changes), [changes]);

  const hasChanges = numChanges > 0;

  /** Accept a change by its segment indices (supports replacement pairs) */
  const acceptChange = useCallback(
    (indices: number[]) => {
      const result = applyDiffAction(segments, indices, "accept");
      setOriginalText(result.originalText);
      setModifiedText(result.modifiedText);
    },
    [segments, setOriginalText, setModifiedText]
  );

  /** Reject a change by its segment indices */
  const rejectChange = useCallback(
    (indices: number[]) => {
      const result = applyDiffAction(segments, indices, "reject");
      setOriginalText(result.originalText);
      setModifiedText(result.modifiedText);
    },
    [segments, setOriginalText, setModifiedText]
  );

  const acceptAll = useCallback(() => {
    const result = applyAllActions(originalText, modifiedText, "accept");
    setOriginalText(result.originalText);
    setModifiedText(result.modifiedText);
  }, [originalText, modifiedText, setOriginalText, setModifiedText]);

  const rejectAll = useCallback(() => {
    const result = applyAllActions(originalText, modifiedText, "reject");
    setOriginalText(result.originalText);
    setModifiedText(result.modifiedText);
  }, [originalText, modifiedText, setOriginalText, setModifiedText]);

  return {
    segments,
    changes,
    stats,
    numChanges,
    hasChanges,
    acceptChange,
    rejectChange,
    acceptAll,
    rejectAll,
  };
}
