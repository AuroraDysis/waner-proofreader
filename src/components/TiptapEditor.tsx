'use client'

import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { Change } from 'diff';

interface TiptapEditorProps {
  content: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  changes?: Change[];
  autoFocus?: boolean;
}

const TiptapEditor = ({
  content,
  onChange,
  readOnly = false,
  placeholder = "",
  changes = [],
  autoFocus = false,
}: TiptapEditorProps) => {
  // plain text to html
  const html = content.replace(/\n/g, '<br>');
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: html,
    editable: !readOnly,
    autofocus: autoFocus,
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert focus:outline-none w-full font-mono min-h-[200px] p-3 whitespace-pre-wrap',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getText());
    },
  });

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(html);
    }
  }, [content, editor]);

  return (
    <div className="relative h-full w-full rounded-md border overflow-hidden group">
      <EditorContent
        editor={editor}
      />
    </div>
  );
};

export default TiptapEditor; 