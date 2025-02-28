import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinkIcon, LockIcon } from "@/components/Icon";
import useLocalStorageState from "use-local-storage-state";

export interface SettingModalProps {
  proofreadError: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingModal({
  proofreadError,
  isOpen,
  onOpenChange,
}: SettingModalProps) {
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          {proofreadError && (
            <DialogDescription className="text-red-600 dark:text-red-400">
              Error: {proofreadError}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="endpoint" className="text-sm font-medium">
              OpenAI Endpoint
            </label>
            <div className="relative">
              <Input
                id="endpoint"
                placeholder="Enter your endpoint"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <LinkIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Must start with http(s)://, empty to use server-side configuration
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="apiKey" className="text-sm font-medium">
              OpenAI API Key
            </label>
            <div className="relative">
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <LockIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={resetSettings}>
            Reset to Default
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
