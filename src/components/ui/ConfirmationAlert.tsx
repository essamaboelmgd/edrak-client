import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { ReactElement, useRef } from "react";

interface ConfirmationAlertProps {
  title: string;
  confirmTitle: string;
  cancelTitle: string;
  onConfirm: () => void;
  trigger: ReactElement;
  children: React.ReactNode;
}

export default function ConfirmationAlert({
  title,
  confirmTitle,
  cancelTitle,
  onConfirm,
  trigger,
  children,
}: ConfirmationAlertProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <>
      <span onClick={onOpen}>{trigger}</span>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {title}
            </AlertDialogHeader>

            <AlertDialogBody>
              {children}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                {cancelTitle}
              </Button>
              <Button colorScheme="red" onClick={handleConfirm} mr={3}>
                {confirmTitle}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}



