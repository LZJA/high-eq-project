import { PhotoSlider } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

interface ImagePreviewProps {
  src: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImagePreview({ src, open, onOpenChange }: ImagePreviewProps) {
  if (!src) return null;

  return (
    <PhotoSlider
      images={[{ src, key: src }]}
      visible={open}
      onClose={() => onOpenChange(false)}
      index={0}
    />
  );
}
