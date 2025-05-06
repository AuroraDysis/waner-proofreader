import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
} from "@heroui/react";
import { LinkIcon, LockIcon } from "@/components/Icon";
import useLocalStorageState from "use-local-storage-state";

export interface SettingModalProps {
  proofreadError: string | null;
  disclosure: ReturnType<typeof useDisclosure>;
}

export default function SettingModal({
  proofreadError,
  disclosure,
}: SettingModalProps) {
  const { isOpen, onOpenChange } = disclosure;

  const [endpoint, setEndpoint] = useLocalStorageState("endpoint", {
    defaultValue: "",
  });

  const [apiKey, setApiKey] = useLocalStorageState("apiKey", {
    defaultValue: "",
  });

  const resetSettings = () => {
    setEndpoint("");
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
                {
                  proofreadError && (
                    <span className="text-sm text-red-600 dark:text-red-400">
                      Error: {proofreadError}
                    </span>
                  )
                }
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
                <Input
                  autoFocus
                  endContent={
                    <LinkIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0 dark:invert" />
                  }
                  label="OpenAI Endpoint (optional)"
                  description="Must start with http(s)://, empty to use server-side configuration"
                  placeholder="Enter your endpoint"
                  variant="bordered"
                  value={endpoint}
                  onValueChange={setEndpoint}
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
