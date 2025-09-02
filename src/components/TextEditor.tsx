"use client";

import { useEffect, useRef } from "react";
import { Textarea, Card, CardBody, CardHeader, Chip } from "@heroui/react";
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
}

export default function TextEditor({
  value,
  onChange,
  label,
  placeholder = "Enter your text here...",
  isReadOnly = false,
  isLoading = false,
  className = "",
}: TextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);
  
  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
  const charCount = value.length;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="h-full">
        <CardHeader className="flex justify-between items-center pb-2">
          <h3 className="text-lg font-semibold">{label}</h3>
          <div className="flex gap-2">
            <Chip size="sm" variant="flat">
              {wordCount} words
            </Chip>
            <Chip size="sm" variant="flat">
              {charCount} chars
            </Chip>
          </div>
        </CardHeader>
        <CardBody className="pt-2">
          <Textarea
            ref={textareaRef}
            value={value}
            onValueChange={onChange}
            placeholder={placeholder}
            isReadOnly={isReadOnly || isLoading}
            minRows={8}
            maxRows={30}
            variant="bordered"
            classNames={{
              input: "text-base",
              inputWrapper: isLoading ? "opacity-60" : ""
            }}
            description={isLoading ? "AI is processing..." : undefined}
          />
        </CardBody>
      </Card>
    </motion.div>
  );
}