"use client";

import { useRef, useEffect, useState, useSyncExternalStore } from "react";
import useLocalStorageState from "use-local-storage-state";
import { useCompletion } from "ai/react";
import { useTheme } from "next-themes";

import {
  Select,
  SelectItem,
  Card,
  CardBody,
  Link,
  useDisclosure,
  Autocomplete,
  AutocompleteItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Spinner,
  Textarea,
} from "@heroui/react";
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

  return (
    <div className="m-4 h-[96vh]">
      <Card className="h-full">
        <CardBody className="overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
                <Autocomplete
                  allowsCustomValue
                  label="Select a model"
                  defaultItems={models.map((model) => ({ key: model }))}
                  inputValue={model}
                  onInputChange={(value) => setModel(value)}
                  className="w-full sm:max-w-sm"
                >
                  {(model) => (
                    <AutocompleteItem key={model.key}>
                      {model.key}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
                <Select
                  label="Select a context"
                  selectedKeys={[context]}
                  onSelectionChange={(keys) =>
                    keys?.currentKey && setContext(keys?.currentKey)
                  }
                  className="w-full sm:max-w-40"
                >
                  {contexts.map((context) => (
                    <SelectItem key={context.key}>{context.label}</SelectItem>
                  ))}
                </Select>
                <Select
                  label="Select an instruction"
                  selectedKeys={[instruction]}
                  onSelectionChange={(keys) =>
                    keys?.currentKey && setInstruction(keys?.currentKey)
                  }
                  className="w-full sm:max-w-md"
                  isDisabled={context === "academic"}
                >
                  {instructions.map((instruction) => (
                    <SelectItem key={instruction.key}>
                      {instruction.prompt}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div className="flex gap-2">
                <IconButton
                  tooltip="GitHub repository"
                  icon={<GithubIcon className="dark:invert h-7 w-7" />}
                  as={Link}
                  isIconOnly
                  href="https://github.com/AuroraDysis/waner-proofreader"
                  isExternal
                />
                <ThemeSwitcher />
                <IconButton
                  tooltip="Settings"
                  icon={<SettingIcon className="dark:invert h-7 w-7" />}
                  onPress={settingDisclosure.onOpen}
                />
                <SettingModal
                  proofreadError={proofreadError}
                  disclosure={settingDisclosure}
                />
                <Popover placement="bottom">
                  <PopoverTrigger>
                    <IconButton
                      tooltip="System Prompt"
                      className="h-12 w-12"
                      icon={<LightbulbIcon className="dark:invert h-7 w-7" />}
                      isIconOnly
                    />
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="min-w-96">
                      <Textarea
                        className="w-full h-full"
                        label="System Prompt"
                        minRows={16}
                        maxRows={16}
                        defaultValue={generate_system_prompt(
                          context,
                          instruction
                        )}
                        isReadOnly
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <IconButton
                  tooltip={isLoading ? "Cancel" : "Proofread"}
                  icon={isLoading ? <Spinner className="h-7 w-7" /> : <EditIcon className="dark:invert h-7 w-7" />}
                  onPress={() => isLoading ? stop() : handleProofread()}
                />
              </div>
            </div>
            <div className="hidden flex-row lg:flex items-center mb-4">
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
            <div className="flex-grow">
              <DiffEditor
                className="h-full"
                language="plaintext"
                options={{ originalEditable: true, wordWrap: "on" }}
                theme={theme === "dark" ? "vs-dark" : "vs"}
                onMount={handleEditorDidMount}
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
