import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";

export interface ErrorModalProps {
  error: string | null;
  onClose: () => void;
  onOpenSettings?: () => void;
}

export default function ErrorModal({ error, onClose, onOpenSettings }: ErrorModalProps) {
  const isOpen = Boolean(error);

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }} placement="top-center">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-danger">Error</ModalHeader>
            <ModalBody>
              <span className="text-sm text-red-600 dark:text-red-400">
                {error}
              </span>
            </ModalBody>
            <ModalFooter>
              {onOpenSettings && (
                <Button variant="flat" onPress={() => { onClose(); onOpenSettings(); }}>
                  Open Settings
                </Button>
              )}
              <Button color="danger" variant="flat" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

