"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardBody, useDisclosure, Tabs, Tab, Button } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";

import TextEditor from "@/components/TextEditor";
import DiffViewer from "@/components/DiffViewer";
import ControlPanel from "@/components/ControlPanel";
import SettingModal from "@/components/SettingModal";
import ErrorModal from "@/components/ErrorModal";
import { EditIcon } from "@/components/Icon";

import { useProofreader } from "@/hooks/useProofreader";
import { useModels } from "@/hooks/useModels";

export default function HomePage() {
  const settingDisclosure = useDisclosure();
  const [activeTab, setActiveTab] = useState("original");
  const [isMobile, setIsMobile] = useState(false);

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
    proofreadError,
    setProofreadError,
    isLoading,
    proofread,
    stop,
  } = useProofreader();

  const { models: availableModels, isLoading: modelsLoading, error: modelsError } = useModels();

  useEffect(() => {
    if (availableModels.length > 0 && !model) {
      setModel(availableModels[0]);
    }
  }, [availableModels, model, setModel]);


  // Switch to modified tab only when proofreading starts on mobile
  useEffect(() => {
    if (isLoading && isMobile) {
      setActiveTab("modified");
    }
  }, [isLoading, isMobile]);

  // Do not auto-open settings on error; show a separate error modal instead

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Always render Diff View to avoid layout flicker while typing

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setOriginalText(text);
    } catch (e) {
      console.error("Failed to read clipboard", e);
    }
  };

  const copyModifiedToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(modifiedText || "");
    } catch (e) {
      console.error("Failed to write clipboard", e);
    }
  };

  const copyOriginalToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(originalText || "");
    } catch (e) {
      console.error("Failed to write clipboard", e);
    }
  };

  const pasteIntoModified = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setModifiedText(text);
    } catch (e) {
      console.error("Failed to read clipboard", e);
    }
  };

  return (
    <div className="h-screen bg-background md:grid md:place-items-center">
      <main className="h-full md:h-[83.3333vh] w-full md:w-9/12">
        {isMobile ? (
          // Mobile: no outer Card, stretch content
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
                  onProofread={proofread}
                  isProofreading={isLoading}
                  onStop={stop}
                  onOpenSettings={settingDisclosure.onOpen}
                  isMobile={isMobile}
                />

                <Card className="flex-1 flex flex-col min-h-0 m-3">
                  <CardBody className="p-0 flex-1 flex flex-col min-h-0">
                    <Tabs
                      className="flex-1 flex flex-col min-h-0 m-3"
                      selectedKey={activeTab}
                      onSelectionChange={(key) => setActiveTab(key as string)}
                      classNames={{
                        "base": "max-h-10",
                        // "tabList": "min-h-15",
                        "panel": "flex flex-col flex-1 w-[calc(100%-1.5rem)] mx-3"
                      }}
                    >
                      <Tab key="original" title="Original">
                        <div className="h-full">
                          <TextEditor
                            value={originalText}
                            onChange={setOriginalText}
                            label={isMobile ? "" : "Original Text"}
                            variant="original"
                            onPaste={pasteFromClipboard}
                            onCopy={copyOriginalToClipboard}
                          />
                        </div>
                      </Tab>
                      <Tab key="modified" title="Modified">
                        <div className="h-full">
                          <TextEditor
                            value={modifiedText}
                            onChange={setModifiedText}
                            label={isMobile ? "" : "Modified Text"}
                            variant="modified"
                            isLoading={isLoading}
                            onPaste={pasteIntoModified}
                            onCopy={copyModifiedToClipboard}
                          />
                        </div>
                      </Tab>
                      <Tab key="diff" title="Compare">
                        <div className="h-full">
                          <DiffViewer original={originalText} modified={modifiedText} />
                        </div>
                      </Tab>
                    </Tabs>
                  </CardBody>
                </Card>

                {!isLoading && (
                  <Button
                    color="primary"
                    size="lg"
                    onPress={proofread}
                    startContent={<EditIcon className="h-7 w-7" />}
                    className="sticky bottom-4 shadow-lg m-3"
                  >
                    Proofread
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Desktop: keep centered Card wrapper
          <Card className="h-full">
            <CardBody className="h-full flex flex-col">
              <div className="h-full min-h-0 flex flex-col gap-4">
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
                  onProofread={proofread}
                  isProofreading={isLoading}
                  onStop={stop}
                  onOpenSettings={settingDisclosure.onOpen}
                />

                <div className="flex-1 min-h-0 flex flex-col">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full min-h-0 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4 h-1/2 min-h-0">
                      <TextEditor
                        value={originalText}
                        onChange={setOriginalText}
                        label="Original Text"
                        variant="original"
                        onPaste={pasteFromClipboard}
                        onCopy={copyOriginalToClipboard}
                      />
                      <TextEditor
                        value={modifiedText}
                        onChange={setModifiedText}
                        label="Modified Text"
                        variant="modified"
                        isLoading={isLoading}
                        onPaste={pasteIntoModified}
                        onCopy={copyModifiedToClipboard}
                      />
                    </div>
                    <div className="h-1/2 min-h-0">
                      <DiffViewer original={originalText} modified={modifiedText} />
                    </div>
                  </motion.div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </main>

      <SettingModal disclosure={settingDisclosure} />
      <ErrorModal
        error={proofreadError}
        onClose={() => setProofreadError(null)}
        onOpenSettings={settingDisclosure.onOpen}
      />
    </div>
  );
}
