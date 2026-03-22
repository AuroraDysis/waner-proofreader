"use client";

import { useMemo } from "react";
import { TextArea, TextField, Label, Card } from "@heroui/react";
import IconButton from "@/components/IconButton";
import { CopyIcon, PasteIcon } from "@/components/Icon";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  isReadOnly?: boolean;
  isLoading?: boolean;
  className?: string;
  onPaste?: () => void | Promise<void>;
  onCopy?: () => void | Promise<void>;
}

export default function TextEditor({
  value,
  onChange,
  label,
  placeholder = "Enter your text here\u2026",
  isReadOnly = false,
  isLoading = false,
  className = "h-full",
  onPaste,
  onCopy,
}: TextEditorProps) {
  const wordCount = useMemo(() => value.trim().split(/\s+/).filter(Boolean).length, [value]);
  const charCount = value.length;

  return (
    <div className={`${className} min-w-0`}>
      <Card className="h-full flex flex-col min-w-0 overflow-clip">
        <Card.Content className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-foreground/60">{label}</span>
            <span className="text-xs text-foreground/40">{wordCount} words, {charCount} chars</span>
            <div className="ml-auto flex items-center">
              {onCopy && (
                <IconButton
                  tooltip="Copy"
                  icon={<CopyIcon className="h-4 w-4" />}
                  size="sm"
                  onPress={onCopy}
                  withTooltip={false}
                />
              )}
              {onPaste && (
                <IconButton
                  tooltip="Paste"
                  icon={<PasteIcon className="h-4 w-4" />}
                  size="sm"
                  onPress={onPaste}
                  withTooltip={false}
                />
              )}
            </div>
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            <TextField
              value={value}
              onChange={onChange}
              isReadOnly={isReadOnly || isLoading}
            >
              <Label className="sr-only">{label || "Text input"}</Label>
              <TextArea
                placeholder={placeholder}
                className="text-base h-full min-h-0 resize-none w-full"
              />
            </TextField>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
