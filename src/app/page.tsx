"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Card, 
  CardBody, 
  Link, 
  useDisclosure, 
  Tabs, 
  Tab,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Textarea,
} from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";

import TextEditor from "@/components/TextEditor";
import DiffViewer from "@/components/DiffViewer";
import ControlPanel from "@/components/ControlPanel";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import IconButton from "@/components/IconButton";
import SettingModal from "@/components/SettingModal";
import ErrorModal from "@/components/ErrorModal";
import { 
  GithubIcon, 
  SettingIcon, 
  LightbulbIcon,
  EditIcon,
} from "@/components/Icon";

import { generate_system_prompt } from "@/lib/prompt";
import { useProofreader } from "@/hooks/useProofreader";
import { useModels } from "@/hooks/useModels";

export default function HomePage() {
  const settingDisclosure = useDisclosure();
  const popoverDisclosure = useDisclosure();
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
  
  const systemPrompt = useMemo(
    () => generate_system_prompt(context, instruction),
    [context, instruction]
  );
  
  const showDiff = useMemo(
    () => originalText.trim() && modifiedText.trim() && originalText !== modifiedText,
    [originalText, modifiedText]
  );
  
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Waner Proofreader
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Popover 
                placement="bottom" 
                isOpen={popoverDisclosure.isOpen}
                onOpenChange={popoverDisclosure.onOpenChange}
              >
                <PopoverTrigger>
                  <IconButton
                    tooltip="System Prompt"
                    icon={<LightbulbIcon className="dark:invert h-7 w-7" />}
                    isIconOnly
                    size="lg"
                  />
                </PopoverTrigger>
                <PopoverContent>
                  <div className="w-80 md:w-96 p-2">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">System Prompt</h3>
                      <Button 
                        size="sm" 
                        variant="light" 
                        isIconOnly
                        onPress={popoverDisclosure.onClose}
                      >
                        ✕
                      </Button>
                    </div>
                    <Textarea
                      value={systemPrompt}
                      minRows={10}
                      maxRows={15}
                      isReadOnly
                      variant="bordered"
                      size="lg"
                    />
                  </div>
                </PopoverContent>
              </Popover>
              
              <IconButton
                tooltip="GitHub"
                icon={<GithubIcon className="dark:invert h-7 w-7" />}
                as={Link}
                isIconOnly
                size="lg"
                href="https://github.com/AuroraDysis/waner-proofreader"
                isExternal
              />
              
              <ThemeSwitcher size="lg" />
              
              <IconButton
                tooltip="Settings"
                icon={<SettingIcon className="dark:invert h-7 w-7" />}
                onPress={settingDisclosure.onOpen}
                size="lg"
              />
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {isMobile ? (
          <div className="space-y-4">
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
            />
            
            <Card>
              <CardBody className="p-0">
                <Tabs
                  selectedKey={activeTab}
                  onSelectionChange={(key) => setActiveTab(key as string)}
                  classNames={{
                    tabList: "w-full",
                    tab: "flex-1",
                  }}
                >
                  <Tab key="original" title="Original">
                    <div className="p-4">
                      <TextEditor
                        value={originalText}
                        onChange={setOriginalText}
                        label="Original Text"
                        variant="original"
                      />
                    </div>
                  </Tab>
                  <Tab key="modified" title="Modified">
                    <div className="p-4">
                      <TextEditor
                        value={modifiedText}
                        onChange={setModifiedText}
                        label="Modified Text"
                        variant="modified"
                        isLoading={isLoading}
                      />
                    </div>
                  </Tab>
                  {showDiff && (
                    <Tab key="diff" title="Compare">
                      <div className="p-4">
                        <DiffViewer
                          original={originalText}
                          modified={modifiedText}
                        />
                      </div>
                    </Tab>
                  )}
                </Tabs>
              </CardBody>
            </Card>
            
            {!isLoading && (
              <Button
                color="primary"
                size="lg"
                onPress={proofread}
                startContent={<EditIcon className="h-7 w-7" />}
                className="w-full sticky bottom-4 shadow-lg"
              >
                Proofread
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
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
                className="sticky top-24"
              />
            </div>
            
            <div className="col-span-9">
              <AnimatePresence mode="wait">
                {showDiff ? (
                  <motion.div
                    key="diff"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <TextEditor
                        value={originalText}
                        onChange={setOriginalText}
                        label="Original Text"
                        variant="original"
                      />
                      <TextEditor
                        value={modifiedText}
                        onChange={setModifiedText}
                        label="Modified Text"
                        variant="modified"
                        isLoading={isLoading}
                      />
                    </div>
                    <DiffViewer
                      original={originalText}
                      modified={modifiedText}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="editors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <TextEditor
                      value={originalText}
                      onChange={setOriginalText}
                      label="Original Text"
                      variant="original"
                    />
                    <TextEditor
                      value={modifiedText}
                      onChange={setModifiedText}
                      label="Modified Text"
                      variant="modified"
                      isLoading={isLoading}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
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
