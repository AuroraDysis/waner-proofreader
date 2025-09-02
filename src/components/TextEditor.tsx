"use client";

import { useRef } from "react";
import { Textarea, Card, CardBody, CardHeader, Chip } from "@heroui/react";
import IconButton from "@/components/IconButton";
import { CopyIcon, PasteIcon } from "@/components/Icon";
import { motion } from "framer-motion";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  isReadOnly?: boolean;
  isLoading?: boolean;
  className?: string;
  variant?: "original" | "modified";
  onPaste?: () => void | Promise<void>;
  onCopy?: () => void | Promise<void>;
  autoResize?: boolean; // when false, fill container and scroll
}

export default function TextEditor({
  value,
  onChange,
  label,
  placeholder = "Enter your text here...",
  isReadOnly = false,
  isLoading = false,
  className = "h-full",
  onPaste,
  onCopy,
}: TextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
  const charCount = value.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="flex justify-between items-center pb-2">
          <h3 className="text-lg font-semibold">{label}</h3>
          <div className="flex items-center gap-2">
            <Chip size="sm" variant="flat">
              {wordCount} words
            </Chip>
            <Chip size="sm" variant="flat">
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
        </CardHeader>
        <CardBody className="pt-2 flex-1 min-h-0">
          <div className="h-full min-h-0">
            <Textarea
              ref={textareaRef}
              value={value}
              onValueChange={onChange}
              placeholder={placeholder}
              isReadOnly={isReadOnly || isLoading}
              variant="bordered"
              classNames={{
                base: "h-full",
                inputWrapper: "!h-full",
                input: "text-base h-full min-h-0 resize-none"
              }}
              description={isLoading ? "AI is processing..." : undefined}
              disableAutosize
            />
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
