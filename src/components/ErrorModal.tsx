import { Modal, Button, useOverlayState } from "@heroui/react";

export interface ErrorModalProps {
  error: string | null;
  onClose: () => void;
  onOpenSettings?: () => void;
}

export default function ErrorModal({ error, onClose, onOpenSettings }: ErrorModalProps) {
  const isOpen = Boolean(error);
  const state = useOverlayState({
    isOpen,
    onOpenChange: (open) => { if (!open) onClose(); },
  });

  return (
    <Modal state={state}>
      <Modal.Backdrop>
        <Modal.Container placement="top">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading className="text-danger">Error</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <span className="text-sm text-red-600 dark:text-red-400">
                {error}
              </span>
            </Modal.Body>
            <Modal.Footer>
              {onOpenSettings && (
                <Button variant="ghost" onPress={() => { onClose(); onOpenSettings(); }}>
                  Open Settings
                </Button>
              )}
              <Button variant="danger-soft" onPress={onClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
