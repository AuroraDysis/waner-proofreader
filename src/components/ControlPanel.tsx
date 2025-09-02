"use client";

import {
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  Button,
  Card,
  CardBody,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Textarea,
  Link,
} from "@heroui/react";
import { EditIcon, GithubIcon, SettingIcon, LightbulbIcon } from "@/components/Icon";
import IconButton from "@/components/IconButton";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { contexts, instructions, generate_system_prompt } from "@/lib/prompt";
import { useMemo } from "react";

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
}

export default function ControlPanel({
  model,
  setModel,
  context,
  setContext,
  instruction,
  setInstruction,
  availableModels,
  modelsLoading,
  modelsError,
  onProofread,
  isProofreading,
  onStop,
  className = "",
  onOpenSettings,
}: ControlPanelProps) {
  const systemPrompt = useMemo(
    () => generate_system_prompt(context, instruction),
    [context, instruction]
  );
  return (
    <Card className={className}>
      <CardBody className="gap-4">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-semibold text-center">Waner Proofreader</h2>
          <div className="flex items-center gap-2">
            <Popover placement="bottom">
              <PopoverTrigger>
                <span>
                  <IconButton
                    tooltip="System Prompt"
                    icon={<LightbulbIcon className="dark:invert h-6 w-6" />}
                    isIconOnly
                    size="md"
                  />
                </span>
              </PopoverTrigger>
              <PopoverContent>
                <div className="w-80 md:w-96 p-2">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">System Prompt</h3>
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
              icon={<GithubIcon className="dark:invert h-6 w-6" />}
              as={Link}
              isIconOnly
              size="md"
              href="https://github.com/AuroraDysis/waner-proofreader"
              isExternal
            />
            <ThemeSwitcher size="md" />
            <IconButton
              tooltip="Settings"
              icon={<SettingIcon className="dark:invert h-6 w-6" />}
              onPress={onOpenSettings}
              size="md"
            />
          </div>
        </div>

        <Autocomplete
          allowsCustomValue
          label="AI Model"
          placeholder="Select or enter a model"
          defaultItems={availableModels.map((m) => ({ key: m, label: m }))}
          inputValue={model ?? ""}
          onInputChange={(value) => setModel(value)}
          selectedKey={model}
          onSelectionChange={(key) => key && setModel(key as string)}
          isLoading={modelsLoading}
          errorMessage={modelsError}
          size="sm"
          variant="bordered"
        >
          {(item) => (
            <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
          )}
        </Autocomplete>
        
        <Select
          label="Context"
          selectedKeys={[context]}
          onSelectionChange={(keys) => {
            const key = Array.from(keys)[0];
            if (key) setContext(key as string);
          }}
          size="sm"
          variant="bordered"
        >
          {contexts.map((ctx) => (
            <SelectItem key={ctx.key}>{ctx.label}</SelectItem>
          ))}
        </Select>
        
        <Select
          label="Style"
          selectedKeys={[instruction]}
          onSelectionChange={(keys) => {
            const key = Array.from(keys)[0];
            if (key) setInstruction(key as string);
          }}
          size="sm"
          variant="bordered"
          isDisabled={context === "academic"}
        >
          {instructions.map((inst) => (
            <SelectItem key={inst.key}>{inst.prompt}</SelectItem>
          ))}
        </Select>
        
        <Button
          color={isProofreading ? "danger" : "primary"}
          variant="flat"
          onPress={isProofreading ? onStop : onProofread}
          startContent={!isProofreading && <EditIcon className="h-4 w-4" />}
          className="w-full"
        >
          {isProofreading ? "Stop" : "Proofread"}
        </Button>

      </CardBody>
    </Card>
  );
}
