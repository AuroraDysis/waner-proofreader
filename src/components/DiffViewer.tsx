"use client";

import { useMemo } from "react";
import { Card, CardBody, Chip, ScrollShadow } from "@heroui/react";
import { motion } from "framer-motion";
import * as Diff from "diff";

interface DiffViewerProps {
  original: string;
  modified: string;
  className?: string;
}

interface DiffSegment {
  type: "unchanged" | "added" | "removed";
  value: string;
}

function computeWordDiff(original: string, modified: string): DiffSegment[] {
  // Preserve spaces and newlines as tokens so formatting differences show up
  const changes = Diff.diffWordsWithSpace(original, modified);
  return changes.map((change) => ({
    type: change.added ? "added" : change.removed ? "removed" : "unchanged",
    value: change.value,
  }));
}

export default function DiffViewer({ original, modified, className = "" }: DiffViewerProps) {
  const diffSegments = useMemo(() => computeWordDiff(original, modified), [original, modified]);
  
  const stats = useMemo(() => {
    const added = diffSegments
      .filter((s) => s.type === "added")
      .reduce((acc, s) => acc + s.value.split(/\s+/).filter(Boolean).length, 0);
    const removed = diffSegments
      .filter((s) => s.type === "removed")
      .reduce((acc, s) => acc + s.value.split(/\s+/).filter(Boolean).length, 0);
    return { added, removed };
  }, [diffSegments]);
  
  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardBody className="flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Diff View</h3>
          <div className="flex gap-2">
            <Chip color="success" variant="flat" size="sm">
              +{stats.added} added
            </Chip>
            <Chip color="danger" variant="flat" size="sm">
              -{stats.removed} removed
            </Chip>
          </div>
        </div>
        
        <ScrollShadow className="flex-1 min-h-0 overflow-auto">
          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap break-words">
            {diffSegments.map((segment, index) => {
              if (segment.type === "unchanged") {
                return (
                  <span key={index} className="text-foreground">
                    {segment.value}
                  </span>
                );
              } else if (segment.type === "added") {
                return (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, backgroundColor: "rgb(34 197 94 / 0.3)" }}
                    animate={{ opacity: 1, backgroundColor: "rgb(34 197 94 / 0.15)" }}
                    transition={{ duration: 0.3 }}
                    className="bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300 px-0.5 rounded"
                  >
                    {segment.value}
                  </motion.span>
                );
              } else {
                return (
                  <motion.span
                    key={index}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ duration: 0.3 }}
                    className="bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300 line-through px-0.5 rounded"
                  >
                    {segment.value}
                  </motion.span>
                );
              }
            })}
          </div>
        </ScrollShadow>
      </CardBody>
    </Card>
  );
}
