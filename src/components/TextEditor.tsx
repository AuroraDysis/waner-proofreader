"use client";

import { useMemo } from "react";
import { TextArea, TextField, Label, Card, Chip } from "@heroui/react";
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
        <Card.Header className="flex justify-between items-center pb-2">
          <Card.Title>{label}</Card.Title>
          <div className="flex items-center gap-2">
            <Chip size="sm" variant="soft">
              {wordCount} words
            </Chip>
            <Chip size="sm" variant="soft">
              {charCount} chars
            </Chip>
            {onCopy && (
              <IconButton
                tooltip="Copy"
                icon={<CopyIcon className="h-5 w-5" />}
                size="sm"
                onPress={onCopy}
              />
            )}
            {onPaste && (
              <IconButton
                tooltip="Paste"
                icon={<PasteIcon className="h-5 w-5" />}
                size="sm"
                onPress={onPaste}
              />
            )}
          </div>
        </Card.Header>
        <Card.Content className="pt-2 flex-1 min-h-0 flex flex-col">
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
