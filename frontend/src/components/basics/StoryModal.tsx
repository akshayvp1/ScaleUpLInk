import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { X, Upload } from 'lucide-react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File, caption: string) => Promise<void>;
}

export const StoryModal: React.FC<StoryModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setCrop(undefined); // Reset crop when new file is selected
    }
  };

  const getCroppedImg = async (image: HTMLImageElement, crop: PixelCrop): Promise<File> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) throw new Error('Canvas is empty');
          resolve(new File([blob], 'story-image.jpg', { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.9
      );
    });
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        9 / 16,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  };

  const handleSubmit = async () => {
    if (!file || !imgRef.current || !completedCrop) {
      alert('Please select an image and complete the crop');
      return;
    }

    setIsLoading(true);
    try {
      const croppedFile = await getCroppedImg(imgRef.current, completedCrop);
      await onSubmit(croppedFile, caption);
      handleClose();
    } catch (error) {
      console.error('Error in StoryModal handleSubmit:', error);
      alert('Failed to create story');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewUrl('');
    setCaption('');
    setCompletedCrop(null);
    setCrop(undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Create Story</h2>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {!previewUrl ? (
            <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400" />
              <span className="mt-2 text-sm text-gray-600">Upload image or video</span>
              <Input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <div className="space-y-4">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c: PixelCrop) => setCompletedCrop(c)}
                aspect={9 / 16}
                className="max-h-[533px] w-full"
              >
                <img
                  ref={imgRef}
                  src={previewUrl}
                  alt="Story preview"
                  onLoad={handleImageLoad}
                  style={{ maxWidth: '100%', maxHeight: '533px', objectFit: 'contain' }}
                />
              </ReactCrop>
              <Input
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}

          {previewUrl && (
            <Button onClick={handleSubmit} disabled={isLoading || !completedCrop}>
              {isLoading ? 'Posting...' : 'Post Story'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};