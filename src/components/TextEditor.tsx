"use client";

import { useEffect, useRef } from "react";
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
  className = "",
  onPaste,
  onCopy,
  autoResize = true,
}: TextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (!textareaRef.current) return;
    if (autoResize) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 200)}px`;
    } else {
      textareaRef.current.style.height = "100%";
    }
  }, [value, autoResize]);
  
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
            {onPaste && (
              <IconButton
                tooltip="Paste"
                icon={<PasteIcon className="h-5 w-5" />}
                size="sm"
                onPress={onPaste}
              />
            )}
            {onCopy && (
              <IconButton
                tooltip="Copy"
                icon={<CopyIcon className="h-5 w-5" />}
                size="sm"
                onPress={onCopy}
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
              minRows={autoResize ? 8 : undefined}
              maxRows={autoResize ? 30 : undefined}
              variant="bordered"
              className="h-full"
              classNames={{
                input: "text-base h-full overflow-auto resize-none",
                inputWrapper: `${isLoading ? "opacity-60" : ""} h-full`
              }}
              description={isLoading ? "AI is processing..." : undefined}
            />
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
