import { useMemo, useCallback } from "react";
import {
  computeWordDiff,
  diffStats,
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

  const stats = useMemo(() => diffStats(segments), [segments]);

  const hasChanges = stats.added > 0 || stats.removed > 0;

  const acceptChange = useCallback(
    (index: number) => {
      const result = applyDiffAction(segments, index, "accept");
      setOriginalText(result.originalText);
      setModifiedText(result.modifiedText);
    },
    [segments, setOriginalText, setModifiedText]
  );

  const rejectChange = useCallback(
    (index: number) => {
      const result = applyDiffAction(segments, index, "reject");
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
    stats,
    hasChanges,
    acceptChange,
    rejectChange,
    acceptAll,
    rejectAll,
  };
}
