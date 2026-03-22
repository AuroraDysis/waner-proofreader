import { diffWordsWithSpace } from "diff";
import type { DiffSegment } from "@/types";

export function computeWordDiff(
  original: string,
  modified: string
): DiffSegment[] {
  const changes = diffWordsWithSpace(original, modified);
  return changes.map((change) => ({
    type: change.added ? "added" : change.removed ? "removed" : "unchanged",
    value: change.value,
  }));
}

export function diffStats(segments: DiffSegment[]) {
  let added = 0;
  let removed = 0;
  for (const s of segments) {
    const words = s.value.split(/\s+/).filter(Boolean).length;
    if (s.type === "added") added += words;
    else if (s.type === "removed") removed += words;
  }
  return { added, removed };
}

/**
 * Apply a single diff change: accept or reject.
 *
 * "accept" means adopt the AI suggestion:
 *   - For a removed segment: delete that text from the original.
 *   - For an added segment: insert that text into the original.
 *
 * "reject" means discard the AI suggestion:
 *   - For a removed segment: keep the original text as-is.
 *   - For an added segment: don't insert the new text.
 *
 * Returns a new { originalText, modifiedText } pair.
 */
export function applyDiffAction(
  segments: DiffSegment[],
  index: number,
  action: "accept" | "reject"
): { originalText: string; modifiedText: string } {
  const newOriginalParts: string[] = [];
  const newModifiedParts: string[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];

    if (i === index) {
      if (action === "accept") {
        // Accept: both sides adopt the modified version
        if (seg.type === "added") {
          newOriginalParts.push(seg.value);
          newModifiedParts.push(seg.value);
        }
        // removed: skip in both (delete from original)
      } else {
        // Reject: both sides keep the original version
        if (seg.type === "removed") {
          newOriginalParts.push(seg.value);
          newModifiedParts.push(seg.value);
        }
        // added: skip in both (discard the addition)
      }
    } else {
      // Untouched segments: keep them in their respective sides
      if (seg.type === "unchanged") {
        newOriginalParts.push(seg.value);
        newModifiedParts.push(seg.value);
      } else if (seg.type === "removed") {
        newOriginalParts.push(seg.value);
      } else {
        newModifiedParts.push(seg.value);
      }
    }
  }

  return {
    originalText: newOriginalParts.join(""),
    modifiedText: newModifiedParts.join(""),
  };
}

/**
 * Accept all changes: original becomes modifiedText.
 * Reject all changes: modified becomes originalText.
 */
export function applyAllActions(
  originalText: string,
  modifiedText: string,
  action: "accept" | "reject"
): { originalText: string; modifiedText: string } {
  if (action === "accept") {
    return { originalText: modifiedText, modifiedText };
  }
  return { originalText, modifiedText: originalText };
}
