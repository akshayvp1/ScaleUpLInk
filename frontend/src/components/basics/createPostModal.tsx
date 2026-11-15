import React, { useState, useRef, useCallback } from 'react';
import { 
  X, 
  ImagePlus, 
  Hash, 
  Send,
  ArrowLeft,
  Loader2,
  ImageIcon,
  Film
} from 'lucide-react';
import postService from '../../services/post/postService'
import Cropper, { Point, Area } from 'react-easy-crop';
import { toast } from "react-hot-toast";


// Assuming postService is imported or defined elsewhere
// import postService from './postService'; // Adjust the import path as necessary

interface Post {
  mediaUrl: string; // Changed from 'image' to 'mediaUrl' to accommodate both image and video
  mediaType: 'image' | 'video'; // To distinguish between image and video
  caption: string;
  hashtags: string[];
}

interface CreatePostModalProps {
  onClose: () => void;
  onPost?: (post: Post) => void;
}

const STEPS: Array<'gallery' | 'crop' | 'caption'> = ['gallery', 'crop', 'caption'];

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onPost }) => {
  const [step, setStep] = useState<'gallery' | 'crop' | 'caption'>('gallery');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // Changed to store File objects
  const [currentMedia, setCurrentMedia] = useState<string | null>(null); // Preview URL
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedMedia, setCroppedMedia] = useState<string | null>(null); // Base64 for images
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const resetState = () => {
    setStep('gallery');
    setSelectedFiles([]);
    setCurrentMedia(null);
    setCroppedMedia(null);
    setMediaType(null);
    setCaption('');
    setHashtags('');
    setIsUploading(false);
  };

  const handleBack = () => {
    switch (step) {
      case 'gallery':
        handleClose();
        break;
      case 'crop':
        setStep('gallery');
        break;
      case 'caption':
        setStep('crop');
        break;
    }
  };
 
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
      const firstFile = fileArray[0];
      const previewUrl = URL.createObjectURL(firstFile);
      setCurrentMedia(previewUrl);
      setMediaType(firstFile.type.startsWith('image') ? 'image' : 'video');
      if (firstFile.type.startsWith('image')) {
        setStep('crop');
      } else {
        setCroppedMedia(previewUrl); // Videos skip cropping
        setStep('caption');
      }
    }
  };

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropImage = async () => {
    if (currentMedia && croppedAreaPixels && mediaType === 'image') {
      try {
        const croppedImg = await getCroppedImg(currentMedia, croppedAreaPixels);
        setCroppedMedia(croppedImg);
        setStep('caption');
      } catch (e) {
        console.error('Crop image error:', e);
      }
    }
  };

  const uploadToCloudinary = async (file: File | Blob, type: 'image' | 'video'): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ad-upload"); // Your Cloudinary upload preset
    formData.append("folder", "scaleuplink/posts");
    const endpoint = type === 'image' 
      ? "https://api.cloudinary.com/v1_1/dedrcfbxf/image/upload"
      : "https://api.cloudinary.com/v1_1/dedrcfbxf/video/upload";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error(`Error uploading ${type} to Cloudinary:`, error);
      throw error;
    }
  };

  const handlePostCreation = async () => {
    if (croppedMedia && mediaType) {
      setIsUploading(true);
      try {
        let mediaUrl: string;

        if (mediaType === 'image') {
          // Convert base64 cropped image to Blob
          const response = await fetch(croppedMedia);
          const blob = await response.blob();
          mediaUrl = await uploadToCloudinary(blob, 'image');
        } else {
          // For video, use the original file
          const videoFile = selectedFiles[0];
          mediaUrl = await uploadToCloudinary(videoFile, 'video');
        }

        const newPost: Post = {
          mediaUrl,
          mediaType,
          caption: caption.trim(),
          hashtags: hashtags.split(',').map(tag => tag.trim()).filter(tag => tag),
        };
         console.log(newPost,"ayyoooooo")
        // Send to postService
        await postService.addPost(newPost);
        
        toast.success("Profile updated successfully!");

        // Optionally call onPost callback if provided
        onPost?.(newPost);
        handleClose();
      } catch (error) {
        console.error("Error creating post:", error);
        alert("Failed to upload media or create post. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const getCroppedImg = (imageSrc: string, pixelCrop: Area): Promise<string> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return reject(new Error('No 2d context'));
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );

        resolve(canvas.toDataURL('image/jpeg'));
      });
      image.src = imageSrc;
    });
  };

  const currentStepIndex = STEPS.indexOf(step);

  const renderGalleryStep = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-background">
      <div 
        className="w-full max-w-md border border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-primary/60 hover:bg-accent/40 transition-all duration-200 group"
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept="image/*,video/*" // Accept both images and videos
          className="hidden"
        />
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-200">
          <ImagePlus 
            className="text-muted-foreground group-hover:text-primary transition-colors duration-200" 
            size={22} 
          />
        </div>
        <p className="text-foreground font-semibold text-sm mb-1.5 tracking-tight">Upload media</p>
        <p className="text-xs text-muted-foreground">PNG, JPG, MP4 — drag and drop or click to browse</p>
      </div>
      {selectedFiles.length > 0 && (
        <div className="mt-5 grid grid-cols-3 gap-2.5 w-full max-w-md">
          {selectedFiles.map((file, index) => (
            <div key={index} className="relative w-full aspect-square rounded-lg overflow-hidden ring-1 ring-border">
              {file.type.startsWith('image') ? (
                <img 
                  src={URL.createObjectURL(file)} 
                  alt={`Selected ${index}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video 
                  src={URL.createObjectURL(file)} 
                  className="w-full h-full object-cover"
                  muted
                />
              )}
              <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                {file.type.startsWith('image') ? (
                  <ImageIcon size={11} className="text-white" />
                ) : (
                  <Film size={11} className="text-white" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCropStep = () => (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-grow relative bg-muted">
        <Cropper
          image={currentMedia || ''}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          style={{ 
            containerStyle: { 
              height: '100%', 
              width: '100%'
            },
            cropAreaStyle: {
              border: '1px solid rgba(249, 115, 22, 0.6)',
            }
          }}
        />
      </div>
      <div className="px-4 py-3.5 flex items-center gap-4 bg-muted border-t border-border">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide shrink-0">Zoom</span>
        <input 
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full accent-primary cursor-pointer"
        />
        <button 
          onClick={handleCropImage}
          className="shrink-0 text-sm font-semibold text-primary-foreground bg-primary px-4 py-1.5 rounded-full hover:bg-primary/90 transition-all duration-200 shadow-sm"
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderCaptionStep = () => (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-grow flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-border">
          {croppedMedia && mediaType === 'image' && (
            <img 
              src={croppedMedia} 
              alt="Cropped" 
              className="w-full h-48 object-cover rounded-lg ring-1 ring-border"
            />
          )}
          {croppedMedia && mediaType === 'video' && (
            <video 
              src={croppedMedia} 
              className="w-full h-48 object-cover rounded-lg ring-1 ring-border"
              controls
            />
          )}
        </div>
        <div className="p-4 flex-grow flex flex-col space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Caption</label>
            <textarea 
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full h-24 p-3 bg-muted text-foreground text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary/60 resize-none placeholder:text-muted-foreground transition-colors duration-150"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Hashtags</label>
            <div className="flex items-center gap-2 px-3 bg-muted border border-border rounded-lg focus-within:ring-2 focus-within:ring-ring/40 focus-within:border-primary/60 transition-colors duration-150">
              <Hash className="text-muted-foreground shrink-0" size={16} />
              <input 
                type="text"
                placeholder="marketing, growth, launch"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="w-full py-2.5 bg-transparent text-foreground text-sm focus:outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-3.5 bg-muted border-t border-border flex justify-between items-center">
        <button 
          onClick={handleBack}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-150 flex items-center gap-1.5"
        >
          <ArrowLeft size={15} />
          Back
        </button>
        <button 
          onClick={handlePostCreation}
          className="bg-primary text-primary-foreground px-5 py-2 rounded-full hover:bg-primary/90 transition-all duration-200 flex items-center gap-2 text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!croppedMedia || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="animate-spin" size={15} />
              Uploading
            </>
          ) : (
            <>
              <Send size={15} /> Post
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-background mx-auto flex h-[560px] max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3.5 bg-muted border-b border-border">
        <button 
          onClick={handleBack}
          className="h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
        >
          {step !== 'gallery' && <ArrowLeft size={17} />}
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">
            {step === 'gallery' ? 'New post' : step === 'crop' ? 'Crop image' : 'Create post'}
          </h2>
          <div className="flex items-center gap-1 mt-1">
            {STEPS.map((s, i) => (
              <span
                key={s}
                className={`h-1 rounded-full transition-all duration-200 ${
                  i === currentStepIndex
                    ? 'w-4 bg-primary'
                    : i < currentStepIndex
                    ? 'w-1 bg-primary/50'
                    : 'w-1 bg-border'
                }`}
              />
            ))}
          </div>
        </div>
        <button 
          onClick={handleClose}
          className="h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
        >
          <X size={17} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-grow min-h-0">
        {step === 'gallery' && renderGalleryStep()}
        {step === 'crop' && renderCropStep()}
        {step === 'caption' && renderCaptionStep()}
      </div>
    </div>
  );
};

export default CreatePostModal;