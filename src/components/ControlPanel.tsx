"use client";

import {
  Select,
  ComboBox,
  Card,
  Popover,
  Button,
  TextArea,
  ListBox,
  Label,
  Input,
  ProgressCircle,
} from "@heroui/react";
import { EditIcon, GithubIcon, SettingIcon, LightbulbIcon, ChevronDownIcon } from "@/components/Icon";
import IconButton from "@/components/IconButton";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { contexts, instructions, generate_system_prompt } from "@/lib/prompt";
import { useMemo, useState } from "react";

interface ControlPanelProps {
  model: string | undefined;
  setModel: (model: string) => void;
  context: string;
  setContext: (context: string) => void;
  instruction: string;
  setInstruction: (instruction: string) => void;
  availableModels: string[];
  modelsLoading: boolean;
  modelsError: string | null;
  onProofread: () => void;
  isProofreading: boolean;
  onStop: () => void;
  className?: string;
  onOpenSettings: () => void;
  isMobile?: boolean;
}

export default function ControlPanel({
  model,
  setModel,
  context,
  setContext,
  instruction,
  setInstruction,
  availableModels,
  modelsLoading: _modelsLoading,
  modelsError: _modelsError,
  onProofread,
  isProofreading,
  onStop,
  className = "m-3",
  onOpenSettings,
  isMobile,
}: ControlPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const systemPrompt = useMemo(
    () => generate_system_prompt(context, instruction),
    [context, instruction]
  );
  return (
    <Card className={`${className} min-w-0`}>
      <Card.Content className="gap-4 flex flex-col md:flex-row md:flex-nowrap md:items-end md:overflow-x-auto">
        <div className="flex items-center gap-2 md:mr-auto">
          <Popover>
            <Popover.Trigger>
              <Button
                aria-label="View system prompt"
                isIconOnly
                size="md"
                variant="ghost"
                className="h-12 w-12"
              >
                <LightbulbIcon className="h-6 w-6" />
              </Button>
            </Popover.Trigger>
            <Popover.Content placement="bottom">
              <Popover.Dialog className="w-80 md:w-96 p-2">
                <Popover.Heading className="text-lg font-semibold mb-2">System Prompt</Popover.Heading>
                <TextArea
                  value={systemPrompt}
                  readOnly
                  className="w-full"
                  rows={10}
                />
              </Popover.Dialog>
            </Popover.Content>
          </Popover>
          <IconButton
            tooltip="GitHub"
            icon={<GithubIcon className="h-6 w-6" />}
            size="md"
            onPress={() => window.open("https://github.com/AuroraDysis/waner-proofreader", "_blank", "noopener,noreferrer")}
          />
          <ThemeSwitcher size="md" />
          <IconButton
            tooltip="Settings"
            icon={<SettingIcon className="h-6 w-6" />}
            onPress={onOpenSettings}
            size="md"
          />
          {isMobile && (
            <IconButton
              tooltip={isExpanded ? "Collapse" : "Expand"}
              icon={<ChevronDownIcon className={`h-6 w-6 transition-transform ${isExpanded ? "rotate-180" : ""}`} />}
              onPress={() => setIsExpanded(!isExpanded)}
              size="md"
            />
          )}
        </div>

        {(!isMobile || isExpanded) && (
          <>
            <ComboBox
              allowsCustomValue
              inputValue={model ?? ""}
              onInputChange={(value) => setModel(value)}
              selectedKey={model}
              onSelectionChange={(key) => key && setModel(key as string)}
              className="w-full md:w-72"
            >
              <Label>AI Model</Label>
              <ComboBox.InputGroup>
                <Input placeholder="Select or enter a model" />
                <ComboBox.Trigger />
              </ComboBox.InputGroup>
              <ComboBox.Popover>
                <ListBox>
                  {availableModels.map((m) => (
                    <ListBox.Item key={m} id={m} textValue={m}>{m}</ListBox.Item>
                  ))}
                </ListBox>
              </ComboBox.Popover>
            </ComboBox>

            <div className="grid grid-cols-2 gap-4 w-full md:contents">
              <Select
                selectedKey={context}
                onSelectionChange={(key) => {
                  if (key) setContext(key as string);
                }}
                className="w-full md:w-56"
              >
                <Label>Context</Label>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {contexts.map((ctx) => (
                      <ListBox.Item key={ctx.key} id={ctx.key} textValue={ctx.label}>{ctx.label}</ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>

              <Select
                selectedKey={instruction}
                onSelectionChange={(key) => {
                  if (key) setInstruction(key as string);
                }}
                isDisabled={context === "academic"}
                className="w-full md:w-56"
              >
                <Label>Style</Label>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {instructions.map((inst) => (
                      <ListBox.Item key={inst.key} id={inst.key} textValue={inst.prompt}>{inst.prompt}</ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
          </>
        )}

        {!isMobile && (
          <IconButton
            tooltip={isProofreading ? "Stop" : "Proofread"}
            onPress={isProofreading ? onStop : onProofread}
            icon={
              isProofreading ? (
                <ProgressCircle aria-label="Proofreading" isIndeterminate size="sm" className="dark:invert">
                  <ProgressCircle.Track>
                    <ProgressCircle.TrackCircle />
                    <ProgressCircle.FillCircle />
                  </ProgressCircle.Track>
                </ProgressCircle>
              ) : (
                <EditIcon className="h-6 w-6" />
              )
            }
            size="md"
          />
        )}
      </Card.Content>
    </Card>
  );
}
