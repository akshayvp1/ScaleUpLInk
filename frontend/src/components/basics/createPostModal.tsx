import React, { useState, useRef, useCallback } from 'react';
import { 
  X, 
  ImagePlus, 
  Hash, 
  Send 
} from 'lucide-react';
import postService from '../../services/post/postService'
import Cropper, { Point, Area } from 'react-easy-crop';
import { toast } from "react-hot-toast";
import { store } from '../../redux/app/store';


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

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
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

  const renderGalleryStep = () => (
    <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-900 text-gray-100">
      <div 
        className="w-full max-w-md border-2 border-dashed border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-800 transition-colors duration-300 group"
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
        <ImagePlus 
          className="mx-auto mb-4 text-gray-500 group-hover:text-gray-300 transition-colors" 
          size={36} 
        />
        <p className="text-gray-300 font-semibold text-base mb-2">Upload Media</p>
        <p className="text-sm text-gray-600">PNG, JPG, JPEG, MP4, etc.</p>
      </div>
      {selectedFiles.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 w-full max-w-md">
          {selectedFiles.map((file, index) => (
            <div key={index} className="w-full h-24 rounded-md shadow-sm overflow-hidden">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCropStep = () => (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex-grow relative">
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
              width: '100%', 
              background: '#1f2937' 
            } 
          }}
        />
      </div>
      <div className="p-3 flex items-center justify-between bg-gray-800 border-t border-gray-700">
        <input 
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full mr-4 accent-gray-500"
        />
        <button 
          onClick={handleCropImage}
          className="text-gray-300 font-medium hover:text-gray-100 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderCaptionStep = () => (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex-grow flex flex-col">
        <div className="p-3 border-b border-gray-700">
          {croppedMedia && mediaType === 'image' && (
            <img 
              src={croppedMedia} 
              alt="Cropped" 
              className="w-full h-48 object-cover rounded-md shadow-sm"
            />
          )}
          {croppedMedia && mediaType === 'video' && (
            <video 
              src={croppedMedia} 
              className="w-full h-48 object-cover rounded-md shadow-sm"
              controls
            />
          )}
        </div>
        <div className="p-4 flex-grow flex flex-col space-y-3">
          <textarea 
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full h-24 p-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 resize-none placeholder-gray-500"
          />
          <div className="flex items-center space-x-2">
            <Hash className="text-gray-500" size={20} />
            <input 
              type="text"
              placeholder="Add hashtags (comma-separated)..."
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="w-full p-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 placeholder-gray-500"
            />
          </div>
        </div>
      </div>
      <div className="p-4 bg-gray-800 border-t border-gray-700 flex justify-between items-center">
        <button 
          onClick={handleBack}
          className="text-gray-300 font-medium hover:text-gray-100 transition-colors"
        >
          Back
        </button>
        <button 
          onClick={handlePostCreation}
          className="bg-gray-600 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition-colors flex items-center text-sm"
          disabled={!croppedMedia || isUploading}
        >
          {isUploading ? (
            "Uploading..."
          ) : (
            <>
              <Send className="mr-2" size={16} /> Post
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-md h-[550px] mx-auto flex flex-col overflow-hidden border border-gray-800">
      {/* Header */}
      <div className="flex justify-between items-center p-3 bg-gray-800 border-b border-gray-700">
        <button 
          onClick={handleBack}
          className="text-gray-400 hover:text-gray-100 transition-colors"
        >
          {step !== 'gallery' && <X size={20} />}
        </button>
        <h2 className="text-base font-semibold text-gray-200">
          {step === 'gallery' ? 'New Post' : step === 'crop' ? 'Crop Image' : 'Create Post'}
        </h2>
        <button 
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-100 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-grow">
        {step === 'gallery' && renderGalleryStep()}
        {step === 'crop' && renderCropStep()}
        {step === 'caption' && renderCaptionStep()}
      </div>
    </div>
  );
};

export default CreatePostModal;