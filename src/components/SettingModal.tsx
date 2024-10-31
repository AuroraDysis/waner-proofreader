import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
} from "@nextui-org/react";
import { LinkIcon, LockIcon } from "@/components/Icon";
import useLocalStorageState from "use-local-storage-state";

export interface SettingModalProps {
  disclosure: ReturnType<typeof useDisclosure>;
}

export default function SettingModal({ disclosure }: SettingModalProps) {
  const { isOpen, onOpenChange } = disclosure;

  const [endpoint, setEndpoint] = useLocalStorageState("endpoint", {
    defaultValue: process.env.NEXT_PUBLIC_URL,
  });

  const [apiKey, setApiKey] = useLocalStorageState("apiKey", {
    defaultValue: "",
  });

  const resetSettings = () => {
    setEndpoint(process.env.NEXT_PUBLIC_URL!);
    setApiKey("");
  };

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Settings
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  endContent={
                    <LinkIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0 dark:invert" />
                  }
                  label="OpenAI Endpoint"
                  description="Must start with http(s)://"
                  placeholder="Enter your endpoint"
                  variant="bordered"
                  value={endpoint}
                  onValueChange={setEndpoint}
                />
                <Input
                  autoFocus
                  endContent={
                    <LockIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0 dark:invert" />
                  }
                  label="OpenAI API Key"
                  placeholder="Enter your API key"
                  type="password"
                  variant="bordered"
                  value={apiKey}
                  onValueChange={setApiKey}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={resetSettings}>
                  Reset to Default
                </Button>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
