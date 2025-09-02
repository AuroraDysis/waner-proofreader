"use client";

import {
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  Button,
  Card,
  CardBody,
} from "@heroui/react";
import { EditIcon } from "@/components/Icon";
import { contexts, instructions } from "@/lib/prompt";

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
}: ControlPanelProps) {
  return (
    <Card className={className}>
      <CardBody className="gap-4">
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