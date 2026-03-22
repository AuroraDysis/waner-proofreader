import { Modal, Button, TextField, Label, InputGroup, Description, useOverlayState } from "@heroui/react";
import { LinkIcon, LockIcon } from "@/components/Icon";

export interface SettingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  endpoint: string;
  setEndpoint: (value: string) => void;
  apiKey: string;
  setApiKey: (value: string) => void;
}

export default function SettingModal({
  isOpen,
  onOpenChange,
  endpoint,
  setEndpoint,
  apiKey,
  setApiKey,
}: SettingModalProps) {
  const state = useOverlayState({ isOpen, onOpenChange });

  const resetSettings = () => {
    setEndpoint("");
    setApiKey("");
  };

  return (
    <Modal state={state}>
      <Modal.Backdrop>
        <Modal.Container placement="top">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>Settings</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <TextField
                autoFocus
                value={apiKey}
                onChange={setApiKey}
                type="password"
              >
                <Label>OpenAI API Key</Label>
                <InputGroup>
                  <InputGroup.Input placeholder="sk-\u2026" autoComplete="off" spellCheck={false} />
                  <InputGroup.Suffix>
                    <LockIcon className="text-2xl text-default-foreground/40 pointer-events-none flex-shrink-0 dark:invert" />
                  </InputGroup.Suffix>
                </InputGroup>
              </TextField>
              <TextField
                value={endpoint}
                onChange={setEndpoint}
                type="url"
              >
                <Label>OpenAI Endpoint (optional)</Label>
                <InputGroup>
                  <InputGroup.Input placeholder="https://api.openai.com/v1" autoComplete="off" />
                  <InputGroup.Suffix>
                    <LinkIcon className="text-2xl text-default-foreground/40 pointer-events-none flex-shrink-0 dark:invert" />
                  </InputGroup.Suffix>
                </InputGroup>
                <Description>Must start with http(s)://, empty to use server-side configuration</Description>
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
