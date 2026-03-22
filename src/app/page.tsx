"use client";

import { useState, useEffect, useDeferredValue, useSyncExternalStore, useCallback } from "react";
import { Card, Tabs, Button, ProgressCircle, toast } from "@heroui/react";

import dynamic from "next/dynamic";
import TextEditor from "@/components/TextEditor";
import ControlPanel from "@/components/ControlPanel";

const SettingModal = dynamic(() => import("@/components/SettingModal"), { ssr: false });
const ErrorModal = dynamic(() => import("@/components/ErrorModal"), { ssr: false });
const DiffViewer = dynamic(() => import("@/components/DiffViewer"), { ssr: false });
import { EditIcon } from "@/components/Icon";

import { useProofreader } from "@/hooks/useProofreader";
import { useModels } from "@/hooks/useModels";

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
                        <Tabs.Tab id="original">Original</Tabs.Tab>
                        <Tabs.Tab id="modified">Modified</Tabs.Tab>
                        <Tabs.Tab id="diff">Compare</Tabs.Tab>
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
                          <DiffViewer original={deferredOriginal} modified={deferredModified} />
                        </div>
                      </Tabs.Panel>
                    </Tabs>
                  </Card.Content>
                </Card>

                <Button
                  variant={isLoading ? "danger" : "primary"}
                  size="lg"
                  onPress={isLoading ? stop : startProofread}
                  className="sticky bottom-4 shadow-lg m-3"
                >
                  {isLoading ? (
                    <ProgressCircle aria-label="Proofreading" size="sm" className="dark:invert" />
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
                    <TextEditor
                      value={originalText}
                      onChange={setOriginalText}
                      label="Original Text"
                      onPaste={pasteFromClipboard}
                    />
                    <TextEditor
                      value={modifiedText}
                      onChange={setModifiedText}
                      label="Modified Text"
                      isLoading={isLoading}
                      onCopy={copyModifiedToClipboard}
                    />
                  </div>
                  <div className="flex-1 min-h-0">
                    <DiffViewer original={deferredOriginal} modified={deferredModified} />
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
