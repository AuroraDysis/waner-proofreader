"use client";

import { useState, useEffect, useRef, useDeferredValue, useSyncExternalStore, useCallback } from "react";
import { Card, Chip, Tabs, Button, ProgressCircle, toast } from "@heroui/react";

import dynamic from "next/dynamic";
import TextEditor from "@/components/TextEditor";
import ControlPanel from "@/components/ControlPanel";

const SettingModal = dynamic(() => import("@/components/SettingModal"), { ssr: false });
const ErrorModal = dynamic(() => import("@/components/ErrorModal"), { ssr: false });
const DiffViewer = dynamic(() => import("@/components/DiffViewer"), { ssr: false });
import { EditIcon } from "@/components/Icon";

import { useProofreader } from "@/hooks/useProofreader";
import { useModels } from "@/hooks/useModels";
import { useDiffChanges } from "@/hooks/useDiffChanges";

const subscribeResize = (callback: () => void) => {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
};
const getSnapshot = () => window.innerWidth < 768;
const getServerSnapshot = () => false;

export default function HomePage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("original");
  const isMobile = useSyncExternalStore(subscribeResize, getSnapshot, getServerSnapshot);

  const {
    originalText,
    setOriginalText,
    modifiedText,
    setModifiedText,
    model,
    setModel,
    context,
    setContext,
    instruction,
    setInstruction,
    endpoint,
    setEndpoint,
    apiKey,
    setApiKey,
    proofreadError,
    setProofreadError,
    isLoading,
    proofread,
    stop,
  } = useProofreader();

  const { models: availableModels, isLoading: modelsLoading, error: modelsError } = useModels();

  const {
    numChanges,
    hasChanges,
    acceptChange,
    rejectChange,
    acceptAll,
    rejectAll,
  } = useDiffChanges({
    originalText,
    modifiedText,
    setOriginalText,
    setModifiedText,
  });

  // Flash the "Your Text" editor green briefly after accepting a change
  const originalEditorRef = useRef<HTMLDivElement>(null);
  const flashOriginalEditor = useCallback(() => {
    const el = originalEditorRef.current;
    if (!el) return;
    el.classList.add("editor-flash");
    const timer = setTimeout(() => el.classList.remove("editor-flash"), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleAcceptChange = useCallback((indices: number[]) => {
    acceptChange(indices);
    flashOriginalEditor();
  }, [acceptChange, flashOriginalEditor]);

  const handleAcceptAll = useCallback(() => {
    acceptAll();
    flashOriginalEditor();
  }, [acceptAll, flashOriginalEditor]);

  useEffect(() => {
    if (availableModels.length === 0) return;
    if (!model || !availableModels.includes(model)) {
      setModel(availableModels[0]);
    }
  }, [availableModels, model, setModel]);

  const deferredOriginal = useDeferredValue(originalText);
  const deferredModified = useDeferredValue(modifiedText);

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setOriginalText(text);
      }
    } catch (e) {
      console.error("Failed to read clipboard", e);
    }
  };

  const copyModifiedToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(modifiedText || "");
      toast("Modified text copied to clipboard", { timeout: 1000 });
    } catch (e) {
      console.error("Failed to write clipboard", e);
      toast("Failed to copy text", { variant: "danger", timeout: 1000 });
    }
  };

  const startProofread = () => {
    if (isMobile) {
      setActiveTab("modified");
    }
    return proofread();
  };

  const onOpenSettings = useCallback(() => setSettingsOpen(true), []);

  return (
    <div className="h-screen bg-background md:grid md:place-items-center">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground">
        Skip to main content
      </a>
      <main id="main-content" className="h-full md:h-[83.3333vh] w-full md:w-9/12 min-w-0 overflow-clip">
        {isMobile ? (
          <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                <ControlPanel
                  model={model}
                  setModel={setModel}
                  context={context}
                  setContext={setContext}
                  instruction={instruction}
                  setInstruction={setInstruction}
                  availableModels={availableModels}
                  modelsLoading={modelsLoading}
                  modelsError={modelsError}
                  onProofread={startProofread}
                  isProofreading={isLoading}
                  onStop={stop}
                  onOpenSettings={onOpenSettings}
                  isMobile={isMobile}
                />

                <Card className="flex-1 flex flex-col min-h-0 m-3">
                  <Card.Content className="p-0 flex-1 flex flex-col min-h-0">
                    <Tabs
                      className="flex-1 flex flex-col min-h-0 m-3"
                      selectedKey={activeTab}
                      onSelectionChange={(key) => setActiveTab(key as string)}
                    >
                      <Tabs.List>
                        <Tabs.Tab id="original">Edit<Tabs.Indicator /></Tabs.Tab>
                        <Tabs.Tab id="modified">Modified<Tabs.Indicator /></Tabs.Tab>
                        <Tabs.Tab id="diff">
                          Changes
                          {!isLoading && hasChanges && (
                            <Chip size="sm" variant="soft" className="ml-1 min-w-0 h-5 text-xs">
                              {numChanges}
                            </Chip>
                          )}
                          <Tabs.Indicator />
                        </Tabs.Tab>
                      </Tabs.List>
                      <Tabs.Panel id="original" className="flex-1 min-h-0 p-3">
                        <div className="h-full">
                          <TextEditor
                            value={originalText}
                            onChange={setOriginalText}
                            label=""
                            onPaste={pasteFromClipboard}
                          />
                        </div>
                      </Tabs.Panel>
                      <Tabs.Panel id="modified" className="flex-1 min-h-0 p-3">
                        <div className="h-full">
                          <TextEditor
                            value={modifiedText}
                            onChange={setModifiedText}
                            label=""
                            isLoading={isLoading}
                            onCopy={copyModifiedToClipboard}
                          />
                        </div>
                      </Tabs.Panel>
                      <Tabs.Panel id="diff" className="flex-1 min-h-0 p-3">
                        <div className="h-full">
                          <DiffViewer
                            original={deferredOriginal}
                            modified={deferredModified}
                            onAcceptChange={handleAcceptChange}
                            onRejectChange={rejectChange}
                            onAcceptAll={handleAcceptAll}
                            onRejectAll={rejectAll}
                            isStreaming={isLoading}
                          />
                        </div>
                      </Tabs.Panel>
                    </Tabs>
                  </Card.Content>
                </Card>

                <Button
                  variant={isLoading ? "danger" : "primary"}
                  size="lg"
                  onPress={isLoading ? stop : startProofread}
                  className="sticky bottom-4 shadow-lg self-center"
                >
                  {isLoading ? (
                    <ProgressCircle aria-label="Proofreading" isIndeterminate size="md" className="dark:invert">
                      <ProgressCircle.Track>
                        <ProgressCircle.TrackCircle />
                        <ProgressCircle.FillCircle />
                      </ProgressCircle.Track>
                    </ProgressCircle>
                  ) : (
                    <EditIcon className="h-7 w-7" />
                  )}
                  {isLoading ? "Stop" : "Proofread"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Card className="h-full overflow-clip">
            <Card.Content className="h-full flex flex-col min-w-0">
              <div className="h-full min-h-0 flex flex-col gap-4 min-w-0">
                <ControlPanel
                  model={model}
                  setModel={setModel}
                  context={context}
                  setContext={setContext}
                  instruction={instruction}
                  setInstruction={setInstruction}
                  availableModels={availableModels}
                  modelsLoading={modelsLoading}
                  modelsError={modelsError}
                  onProofread={startProofread}
                  isProofreading={isLoading}
                  onStop={stop}
                  onOpenSettings={onOpenSettings}
                />

                <div className="flex-1 min-h-0 min-w-0 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4 flex-1 min-h-0 min-w-0">
                    <div ref={originalEditorRef} className="min-w-0 transition-shadow duration-500">
                      <TextEditor
                        value={originalText}
                        onChange={setOriginalText}
                        label="Your Text"
                        onPaste={pasteFromClipboard}
                        className="h-full"
                      />
                    </div>
                    <TextEditor
                      value={modifiedText}
                      onChange={setModifiedText}
                      label="AI Suggestion"
                      isLoading={isLoading}
                      onCopy={copyModifiedToClipboard}
                    />
                  </div>
                  <div className="flex-1 min-h-0">
                    <DiffViewer
                      original={deferredOriginal}
                      modified={deferredModified}
                      onAcceptChange={handleAcceptChange}
                      onRejectChange={rejectChange}
                      onAcceptAll={handleAcceptAll}
                      onRejectAll={rejectAll}
                      isStreaming={isLoading}
                    />
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>
        )}
      </main>

      <SettingModal
        isOpen={settingsOpen}
        onOpenChange={setSettingsOpen}
        endpoint={endpoint}
        setEndpoint={setEndpoint}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />
      <ErrorModal
        error={proofreadError}
        onClose={() => setProofreadError(null)}
        onOpenSettings={onOpenSettings}
      />
    </div>
  );
}
