import { useState } from "react";

export function useDisclosure(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const onToggle = () => setIsOpen(!isOpen);
  const onOpenChange = (open: boolean) => setIsOpen(open);

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
    onOpenChange,
  };
} 