import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImagePreviewProps {
  src: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImagePreview({ src, open, onOpenChange }: ImagePreviewProps) {
  if (!src) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <img src={src} alt="预览" className="w-full h-auto" />
      </DialogContent>
    </Dialog>
  );
}
