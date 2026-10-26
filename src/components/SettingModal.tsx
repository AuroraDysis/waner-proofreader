import { Modal, Button, TextField, Label, InputGroup, Description, useOverlayState } from "@heroui/react";
import { ChipIcon, LinkIcon, LockIcon } from "@/components/Icon";
import { DEFAULT_MODEL } from "@/lib/model";

export interface SettingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  endpoint: string;
  setEndpoint: (value: string) => void;
  apiKey: string;
  setApiKey: (value: string) => void;
  model: string;
  setModel: (value: string) => void;
}

export default function SettingModal({
  isOpen,
  onOpenChange,
  endpoint,
  setEndpoint,
  apiKey,
  setApiKey,
  model,
  setModel,
}: SettingModalProps) {
  const state = useOverlayState({ isOpen, onOpenChange });

  const resetSettings = () => {
    setEndpoint("");
    setApiKey("");
    setModel("");
  };

  return (
    <Modal state={state}>
      <Modal.Backdrop>
        <Modal.Container placement="top">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>Settings</Modal.Heading>
            </Modal.Header>
            {/* grid, not flex-col: HeroUI gives the fields flex: 1, which equalizes their heights */}
            <Modal.Body className="overflow-visible grid gap-4">
              <TextField
                autoFocus
                value={apiKey}
                onChange={setApiKey}
                type="password"
              >
                <Label>API Key</Label>
                <InputGroup>
                  <InputGroup.Input placeholder="sk-…" autoComplete="off" spellCheck={false} />
                  <InputGroup.Suffix>
                    <LockIcon className="text-2xl text-default-foreground/40 pointer-events-none flex-shrink-0" />
                  </InputGroup.Suffix>
                </InputGroup>
              </TextField>
              <TextField
                value={endpoint}
                onChange={setEndpoint}
                type="url"
              >
                <Label>Endpoint (optional)</Label>
                <InputGroup>
                  <InputGroup.Input placeholder="https://openrouter.ai/api/v1" autoComplete="off" />
                  <InputGroup.Suffix>
                    <LinkIcon className="text-2xl text-default-foreground/40 pointer-events-none flex-shrink-0" />
                  </InputGroup.Suffix>
                </InputGroup>
                <Description>Must start with http(s)://, empty to use OpenRouter</Description>
              </TextField>
              <TextField
                value={model}
                onChange={setModel}
              >
                <Label>Model (optional)</Label>
                <InputGroup>
                  <InputGroup.Input placeholder={DEFAULT_MODEL} autoComplete="off" spellCheck={false} />
                  <InputGroup.Suffix>
                    <ChipIcon className="text-2xl text-default-foreground/40 pointer-events-none flex-shrink-0" />
                  </InputGroup.Suffix>
                </InputGroup>
                <Description>Used only with your own API key, empty for the default</Description>
              </TextField>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" onPress={resetSettings}>
                Reset to Default
              </Button>
              <Button variant="danger-soft" onPress={state.close}>
                Close
              </Button>
              <Button variant="primary" onPress={state.close}>
                Save
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
