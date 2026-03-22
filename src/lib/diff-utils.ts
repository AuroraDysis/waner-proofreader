import { diffWordsWithSpace } from "diff";
import type { DiffSegment } from "@/types";

export interface DiffChange {
  /** "replacement" = adjacent removed+added pair (one logical change) */
  type: "unchanged" | "added" | "removed" | "replacement";
  /** Segment indices into the raw segments array */
  indices: number[];
  /** The segment(s) involved */
  segments: DiffSegment[];
}

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

/**
 * Group raw diff segments: merge adjacent removed+added into a single "replacement".
 */
export function groupDiffSegments(segments: DiffSegment[]): DiffChange[] {
  const changes: DiffChange[] = [];
  let i = 0;
  while (i < segments.length) {
    const seg = segments[i];
    if (
      seg.type === "removed" &&
      i + 1 < segments.length &&
      segments[i + 1].type === "added"
    ) {
      changes.push({
        type: "replacement",
        indices: [i, i + 1],
        segments: [seg, segments[i + 1]],
      });
      i += 2;
    } else {
      changes.push({
        type: seg.type,
        indices: [i],
        segments: [seg],
      });
      i += 1;
    }
  }
  return changes;
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

/** Count logical changes (replacements count as 1) */
export function changeCount(changes: DiffChange[]): number {
  return changes.filter((c) => c.type !== "unchanged").length;
}

/**
 * Apply a diff action on one or more segment indices simultaneously.
 *
 * "accept" = adopt AI suggestion (delete removed text, insert added text)
 * "reject" = discard AI suggestion (keep removed text, drop added text)
 */
export function applyDiffAction(
  segments: DiffSegment[],
  indices: number[],
  action: "accept" | "reject"
): { originalText: string; modifiedText: string } {
  const targetSet = new Set(indices);
  const newOriginalParts: string[] = [];
  const newModifiedParts: string[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];

    if (targetSet.has(i)) {
      if (action === "accept") {
        if (seg.type === "added") {
          newOriginalParts.push(seg.value);
          newModifiedParts.push(seg.value);
        }
        // removed: skip in both (delete from original)
      } else {
        if (seg.type === "removed") {
          newOriginalParts.push(seg.value);
          newModifiedParts.push(seg.value);
        }
        // added: skip in both (discard the addition)
      }
    } else {
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
