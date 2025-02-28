"use client";

import { useRef, useEffect, useState, useSyncExternalStore } from "react";
import useLocalStorageState from "use-local-storage-state";
import { useCompletion } from "ai/react";
import { useTheme } from "next-themes";
import { useDisclosure } from "@/lib/hooks";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DiffEditor, useMonaco } from "@monaco-editor/react";
import type { MonacoDiffEditor } from "@monaco-editor/react";

import {
  EditIcon,
  LightbulbIcon,
  GithubIcon,
  SettingIcon,
} from "@/components/Icon";

import {
  models,
  contexts,
  instructions,
  generate_system_prompt,
} from "@/lib/prompt";

import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import IconButton from "@/components/IconButton";
import SettingModal from "@/components/SettingModal";
import Spinner from "@/components/Spinner";

// https://github.com/astoilkov/use-local-storage-state/issues/56
function useIsServerRender() {
  const isServerRender = useSyncExternalStore(
    () => {
      return () => { };
    },
    () => false,
    () => true
  );
  return isServerRender;
}

export default function HomePage() {
  const [editorMounted, setEditorMounted] = useState(false);
  const editorRef = useRef<MonacoDiffEditor | null>(null);

  const settingDisclosure = useDisclosure();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [model, setModel] = useLocalStorageState("model", {
    defaultValue: models[0],
  });
  const [context, setContext] = useLocalStorageState("context", {
    defaultValue: contexts[0].key,
  });
  const [instruction, setInstruction] = useLocalStorageState("instruction", {
    defaultValue: instructions[0].key,
  });
  const [originalText, setOriginalText] = useLocalStorageState<string>(
    "originalText",
    {
      defaultValue: "",
    }
  );
  const [modifiedText, setModifiedText] = useLocalStorageState<string>(
    "modifiedText",
    {
      defaultValue: "",
    }
  );

  const [proofreadError, setProofreadError] = useState<string | null>(null);

  const [endpoint] = useLocalStorageState("endpoint", {
    defaultValue: "",
  });

  const [apiKey] = useLocalStorageState("apiKey", {
    defaultValue: "",
  });

  const [leftHeaderWidth, setLeftHeaderWidth] = useState<number | null>(null);

  const isServerRender = useIsServerRender();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (isServerRender) {
      return;
    }

    // context must be one of the available contexts
    if (!contexts.some((c) => c.key === context)) {
      setContext(contexts[0].key);
    }

    // instruction must be one of the available instructions
    if (!instructions.some((i) => i.key === instruction)) {
      setInstruction(instructions[0].key);
    }
  }, [isServerRender]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize the text in the editor
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (isServerRender || !editorMounted) {
      return;
    }
    editorRef.current?.getOriginalEditor().setValue(originalText);
    editorRef.current?.getModifiedEditor().setValue(modifiedText);
  }, [isServerRender, editorMounted]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEditorDidMount = (editor: MonacoDiffEditor) => {
    editorRef.current = editor;

    const handleOriginalContentChange = () => {
      const value = editor.getOriginalEditor().getValue();
      if (value !== originalText) {
        setOriginalText(value);
      }
    };

    const handleModifiedContentChange = () => {
      const value = editor.getModifiedEditor().getValue();
      if (value !== modifiedText) {
        setModifiedText(value);
      }
    };

    editor
      .getOriginalEditor()
      .onDidChangeModelContent(handleOriginalContentChange);
    editor
      .getModifiedEditor()
      .onDidChangeModelContent(handleModifiedContentChange);

    editor.getOriginalEditor().onDidLayoutChange((layout) => {
      setLeftHeaderWidth(layout.width);
    });

    setEditorMounted(true);
  };

  const { completion, complete, isLoading, stop } = useCompletion({
    onError: (error) => {
      setProofreadError(error.message);
      settingDisclosure.onOpen();
    },
    onFinish: () => {
      setProofreadError(null);
    },
  });

  useEffect(() => {
    if (completion) {
      editorRef.current?.getModifiedEditor().setValue(completion);
    }
  }, [completion]);

  const handleProofread = async () => {
    if (editorRef.current) {
      let currentModel = model;
      if (!models.includes(model)) {
        setModel(models[0]);
        currentModel = models[0];
      }
      try {
        await complete(originalText || "", {
          body: {
            model: currentModel,
            context: context,
            instruction: instruction,
            endpoint: endpoint,
            apiKey: apiKey,
          },
        });
      } catch (error) {
        console.error("Proofreading failed:", error);
      }
    }
  };

  const { theme } = useTheme();

  const monaco = useMonaco();
  useEffect(() => {
    if (editorMounted && monaco) {
      monaco.editor.setTheme(theme === "dark" ? "vs-dark" : "vs");
    }
  }, [monaco, theme, editorMounted]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="h-screen w-full flex flex-col p-2 sm:p-4">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg sm:text-xl">Waner Proofreader</CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden" 
                onClick={toggleMobileMenu}
                aria-label="Menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {mobileMenuOpen ? (
                    <path d="M18 6L6 18M6 6l12 12" />
                  ) : (
                    <path d="M3 12h18M3 6h18M3 18h18" />
                  )}
                </svg>
              </Button>
              <div className="hidden md:flex items-center gap-2">
                <IconButton
                  tooltip="GitHub repository"
                  icon={<GithubIcon className="dark:invert h-6 w-6" />}
                  href="https://github.com/AuroraDysis/waner-proofreader"
                  target="_blank"
                  rel="noopener noreferrer"
                />
                <ThemeSwitcher />
                <IconButton
                  tooltip="Settings"
                  icon={<SettingIcon className="dark:invert h-6 w-6" />}
                  onClick={settingDisclosure.onOpen}
                />
                <Popover>
                  <PopoverTrigger>
                    <IconButton
                      tooltip="System Prompt"
                      icon={<LightbulbIcon className="dark:invert h-6 w-6" />}
                    />
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="min-w-[300px] max-w-[500px]">
                      <Textarea
                        className="w-full h-full"
                        placeholder="System Prompt"
                        rows={16}
                        value={generate_system_prompt(context, instruction)}
                        readOnly
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <IconButton
                  tooltip={isLoading ? "Cancel" : "Proofread"}
                  icon={isLoading ? <Spinner color="current" className="h-6 w-6" /> : <EditIcon className="dark:invert h-6 w-6" />}
                  onClick={() => isLoading ? stop() : handleProofread()}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-4 pt-3 flex-1 flex flex-col overflow-hidden">
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden p-3 bg-muted/20 rounded-md mb-3">
              <div className="grid grid-cols-1 gap-3">
                <Select value={model} onValueChange={(value: string) => setModel(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={context} onValueChange={(value: string) => setContext(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a context" />
                  </SelectTrigger>
                  <SelectContent>
                    {contexts.map((context) => (
                      <SelectItem key={context.key} value={context.key}>
                        {context.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={instruction} onValueChange={(value: string) => setInstruction(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an instruction" />
                  </SelectTrigger>
                  <SelectContent>
                    {instructions.map((instruction) => (
                      <SelectItem key={instruction.key} value={instruction.key}>
                        {instruction.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex justify-between items-center gap-2">
                  <IconButton
                    tooltip="GitHub repository"
                    icon={<GithubIcon className="dark:invert h-6 w-6" />}
                    href="https://github.com/AuroraDysis/waner-proofreader"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                  <ThemeSwitcher />
                  <IconButton
                    tooltip="Settings"
                    icon={<SettingIcon className="dark:invert h-6 w-6" />}
                    onClick={settingDisclosure.onOpen}
                  />
                  <Popover>
                    <PopoverTrigger>
                      <IconButton
                        tooltip="System Prompt"
                        icon={<LightbulbIcon className="dark:invert h-6 w-6" />}
                      />
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="min-w-[250px] max-w-[350px]">
                        <Textarea
                          className="w-full h-full"
                          placeholder="System Prompt"
                          rows={12}
                          value={generate_system_prompt(context, instruction)}
                          readOnly
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <IconButton
                    tooltip={isLoading ? "Cancel" : "Proofread"}
                    icon={isLoading ? <Spinner color="current" className="h-6 w-6" /> : <EditIcon className="dark:invert h-6 w-6" />}
                    onClick={() => isLoading ? stop() : handleProofread()}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Desktop controls */}
          <div className="hidden md:flex items-center gap-3 mb-3">
            <Select value={model} onValueChange={(value: string) => setModel(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={context} onValueChange={(value: string) => setContext(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a context" />
              </SelectTrigger>
              <SelectContent>
                {contexts.map((context) => (
                  <SelectItem key={context.key} value={context.key}>
                    {context.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={instruction} onValueChange={(value: string) => setInstruction(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select an instruction" />
              </SelectTrigger>
              <SelectContent>
                {instructions.map((instruction) => (
                  <SelectItem key={instruction.key} value={instruction.key}>
                    {instruction.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Editor headers */}
          <div className="hidden md:flex items-center mb-2">
            <div
              className="flex justify-center font-bold"
              style={{
                width: `${leftHeaderWidth ? leftHeaderWidth - 14 : "50%"}px`,
              }}
            >
              Original Text
            </div>
            <div className="flex justify-center font-bold flex-1">
              Modified Text
            </div>
          </div>

          {/* Mobile editor headers */}
          <div className="flex md:hidden items-center mb-2 text-sm font-medium">
            <div className="flex-1 text-center">Original</div>
            <div className="flex-1 text-center">Modified</div>
          </div>

          {/* Editor */}
          <div className="flex-1 min-h-0 border rounded-md overflow-hidden">
            <DiffEditor
              className="h-full"
              language="plaintext"
              options={{ 
                originalEditable: true, 
                wordWrap: "on",
                minimap: { enabled: false },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true
              }}
              theme={theme === "dark" ? "vs-dark" : "vs"}
              onMount={handleEditorDidMount}
            />
          </div>

          {/* Mobile action button */}
          <div className="md:hidden flex justify-center mt-3">
            <Button 
              className="w-full"
              onClick={() => isLoading ? stop() : handleProofread()}
              disabled={!originalText}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner color="current" className="h-4 w-4" />
                  Cancel
                </span>
              ) : (
                "Proofread"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <SettingModal
        proofreadError={proofreadError}
        isOpen={settingDisclosure.isOpen}
        onOpenChange={settingDisclosure.onOpenChange}
      />
    </div>
  );
}
