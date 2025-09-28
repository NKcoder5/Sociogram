import React, { useState, useRef, useCallback } from 'react';
import { 
  PhotoIcon, 
  VideoCameraIcon,
  DocumentIcon,
  PaperClipIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  ShareIcon,
  HeartIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

const MediaSharing = ({ 
  onFileSelect, 
  onFileSend, 
  selectedFiles = [], 
  onFileRemove,
  dragOver,
  setDragOver 
}) => {
  const [previewMode, setPreviewMode] = useState(null); // 'gallery', 'document', 'video'
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [compressionQuality, setCompressionQuality] = useState(0.8);
  const [showCompressionOptions, setShowCompressionOptions] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const supportedTypes = {
    images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    videos: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/aac']
  };

  const maxFileSizes = {
    image: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
    document: 25 * 1024 * 1024, // 25MB
    audio: 50 * 1024 * 1024 // 50MB
  };

  const handleFileSelection = useCallback((files) => {
    const validFiles = [];
    const errors = [];

    Array.from(files).forEach(file => {
      const fileType = getFileType(file.type);
      const maxSize = maxFileSizes[fileType];

      if (file.size > maxSize) {
        errors.push(`${file.name} is too large. Maximum size for ${fileType} files is ${formatFileSize(maxSize)}`);
        return;
      }

      if (!isFileTypeSupported(file.type)) {
        errors.push(`${file.name} has an unsupported file type`);
        return;
      }

      validFiles.push({
        file,
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        fileType: fileType,
        preview: null,
        compressed: null
      });
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      generatePreviews(validFiles);
      onFileSelect(validFiles);
    }
  }, [onFileSelect]);

  const generatePreviews = async (files) => {
    const updatedFiles = await Promise.all(
      files.map(async (fileObj) => {
        if (fileObj.fileType === 'image') {
          const preview = await createImagePreview(fileObj.file);
          const compressed = await compressImage(fileObj.file, compressionQuality);
          return { ...fileObj, preview, compressed };
        } else if (fileObj.fileType === 'video') {
          const preview = await createVideoThumbnail(fileObj.file);
          return { ...fileObj, preview };
        }
        return fileObj;
      })
    );
    
    onFileSelect(updatedFiles);
  };

  const createImagePreview = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  };

  const createVideoThumbnail = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        video.currentTime = 1; // Seek to 1 second
      };

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0);
        resolve(canvas.toDataURL());
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const compressImage = (file, quality) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1920x1080)
        let { width, height } = img;
        const maxWidth = 1920;
        const maxHeight = 1080;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(resolve, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const getFileType = (mimeType) => {
    if (supportedTypes.images.includes(mimeType)) return 'image';
    if (supportedTypes.videos.includes(mimeType)) return 'video';
    if (supportedTypes.documents.includes(mimeType)) return 'document';
    if (supportedTypes.audio.includes(mimeType)) return 'audio';
    return 'other';
  };

  const isFileTypeSupported = (mimeType) => {
    return Object.values(supportedTypes).flat().includes(mimeType);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  const getFileIcon = (fileType, mimeType) => {
    switch (fileType) {
      case 'image':
        return <PhotoIcon className="w-8 h-8 text-blue-500" />;
      case 'video':
        return <VideoCameraIcon className="w-8 h-8 text-red-500" />;
      case 'audio':
        return <SpeakerWaveIcon className="w-8 h-8 text-green-500" />;
      case 'document':
        if (mimeType.includes('pdf')) {
          return <DocumentIcon className="w-8 h-8 text-red-600" />;
        }
        return <DocumentIcon className="w-8 h-8 text-gray-600" />;
      default:
        return <PaperClipIcon className="w-8 h-8 text-gray-500" />;
    }
  };

  const openPreview = (index, mode) => {
    setCurrentPreviewIndex(index);
    setPreviewMode(mode);
    setZoom(1);
  };

  const closePreview = () => {
    setPreviewMode(null);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const navigatePreview = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentPreviewIndex + 1) % selectedFiles.length
      : (currentPreviewIndex - 1 + selectedFiles.length) % selectedFiles.length;
    setCurrentPreviewIndex(newIndex);
  };

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleZoom = (direction) => {
    const newZoom = direction === 'in' 
      ? Math.min(zoom * 1.2, 5) 
      : Math.max(zoom / 1.2, 0.1);
    setZoom(newZoom);
  };

  const downloadFile = (fileObj) => {
    const url = URL.createObjectURL(fileObj.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileObj.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files);
    }
  }, [handleFileSelection, setDragOver]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, [setDragOver]);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, [setDragOver]);

  return (
    <div className="media-sharing-container">
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => handleFileSelection(e.target.files)}
        accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,audio/*"
        className="hidden"
      />

      {/* Upload Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
        title="Attach files"
      >
        <PaperClipIcon className="w-5 h-5" />
      </button>

      {/* Drag and Drop Overlay */}
      {dragOver && (
        <div 
          className="fixed inset-0 bg-blue-50 bg-opacity-90 border-2 border-dashed border-blue-300 flex items-center justify-center z-50"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="text-center">
            <PaperClipIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <p className="text-xl font-semibold text-blue-700 mb-2">Drop files here</p>
            <p className="text-blue-600">Images, videos, documents, and audio files supported</p>
          </div>
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">
              Selected Files ({selectedFiles.length})
            </h4>
            {selectedFiles.some(f => f.fileType === 'image') && (
              <button
                onClick={() => setShowCompressionOptions(!showCompressionOptions)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Compression Settings
              </button>
            )}
          </div>

          {/* Compression Options */}
          {showCompressionOptions && (
            <div className="mb-4 p-3 bg-white rounded border">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Quality: {Math.round(compressionQuality * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={compressionQuality}
                onChange={(e) => setCompressionQuality(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower quality = smaller file size
              </p>
            </div>
          )}

          {/* Files Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {selectedFiles.map((fileObj, index) => (
              <div key={fileObj.id} className="relative group">
                <div className="aspect-square bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                  {fileObj.fileType === 'image' && fileObj.preview ? (
                    <img
                      src={fileObj.preview}
                      alt={fileObj.name}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => openPreview(index, 'gallery')}
                    />
                  ) : fileObj.fileType === 'video' && fileObj.preview ? (
                    <div 
                      className="relative w-full h-full cursor-pointer"
                      onClick={() => openPreview(index, 'video')}
                    >
                      <img
                        src={fileObj.preview}
                        alt={fileObj.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <PlayIcon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="w-full h-full flex flex-col items-center justify-center p-2 cursor-pointer"
                      onClick={() => openPreview(index, 'document')}
                    >
                      {getFileIcon(fileObj.fileType, fileObj.type)}
                      <p className="text-xs text-gray-600 text-center mt-1 truncate w-full">
                        {fileObj.name}
                      </p>
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 text-xs">
                  <p className="truncate">{fileObj.name}</p>
                  <p>{formatFileSize(fileObj.size)}</p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => onFileRemove(fileObj.id)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>

                {/* Actions */}
                <div className="absolute top-1 left-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openPreview(index, fileObj.fileType === 'image' ? 'gallery' : fileObj.fileType === 'video' ? 'video' : 'document')}
                    className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center"
                  >
                    <EyeIcon className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => downloadFile(fileObj)}
                    className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center"
                  >
                    <ArrowDownTrayIcon className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Send Button */}
          <button
            onClick={() => onFileSend(selectedFiles)}
            className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium"
          >
            Send {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Preview Modal */}
      {previewMode && selectedFiles[currentPreviewIndex] && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={closePreview}
              className="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-20 text-white rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors z-10"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Navigation */}
            {selectedFiles.length > 1 && (
              <>
                <button
                  onClick={() => navigatePreview('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 text-white rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={() => navigatePreview('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 text-white rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                >
                  →
                </button>
              </>
            )}

            {/* Content */}
            <div className="max-w-full max-h-full">
              {previewMode === 'gallery' && (
                <div className="relative">
                  <img
                    src={selectedFiles[currentPreviewIndex].preview}
                    alt={selectedFiles[currentPreviewIndex].name}
                    className="max-w-full max-h-full object-contain"
                    style={{ transform: `scale(${zoom})` }}
                  />
                  
                  {/* Zoom Controls */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    <button
                      onClick={() => handleZoom('out')}
                      className="w-10 h-10 bg-white bg-opacity-20 text-white rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                    >
                      <MagnifyingGlassMinusIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleZoom('in')}
                      className="w-10 h-10 bg-white bg-opacity-20 text-white rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                    >
                      <MagnifyingGlassPlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {previewMode === 'video' && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    src={URL.createObjectURL(selectedFiles[currentPreviewIndex].file)}
                    className="max-w-full max-h-full"
                    controls
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>
              )}

              {previewMode === 'document' && (
                <div className="bg-white rounded-lg p-8 max-w-md">
                  <div className="text-center">
                    {getFileIcon(selectedFiles[currentPreviewIndex].fileType, selectedFiles[currentPreviewIndex].type)}
                    <h3 className="text-lg font-semibold mt-4 mb-2">
                      {selectedFiles[currentPreviewIndex].name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {formatFileSize(selectedFiles[currentPreviewIndex].size)}
                    </p>
                    <button
                      onClick={() => downloadFile(selectedFiles[currentPreviewIndex])}
                      className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Download File
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded-lg">
              <p className="font-semibold">{selectedFiles[currentPreviewIndex].name}</p>
              <p className="text-sm text-gray-300">
                {formatFileSize(selectedFiles[currentPreviewIndex].size)} • 
                {currentPreviewIndex + 1} of {selectedFiles.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Media Display Component for received messages
export const MediaDisplay = ({ message, isOwn = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  
  const videoRef = useRef(null);

  const getFileType = (mimeType) => {
    if (mimeType?.startsWith('image/')) return 'image';
    if (mimeType?.startsWith('video/')) return 'video';
    if (mimeType?.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const fileType = getFileType(message.fileType);

  if (!message.fileUrl) return null;

  return (
    <div className={`media-display max-w-xs lg:max-w-md ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
      {fileType === 'image' && (
        <div className="relative group">
          <img
            src={message.fileUrl}
            alt={message.fileName}
            className="w-full h-auto rounded-lg cursor-pointer"
            onClick={() => setShowFullscreen(true)}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
            <button
              onClick={() => setShowFullscreen(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-20 text-white p-2 rounded-full"
            >
              <ArrowsPointingOutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {fileType === 'video' && (
        <div className="relative">
          <video
            ref={videoRef}
            src={message.fileUrl}
            className="w-full h-auto rounded-lg"
            controls
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>
      )}

      {fileType === 'document' && (
        <div className={`p-4 rounded-lg border ${
          isOwn ? 'bg-purple-100 border-purple-200' : 'bg-gray-100 border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <DocumentIcon className="w-8 h-8 text-gray-600" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{message.fileName}</p>
              <p className="text-sm text-gray-500">{formatFileSize(message.fileSize)}</p>
            </div>
            <a
              href={message.fileUrl}
              download={message.fileName}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {showFullscreen && fileType === 'image' && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-20 text-white rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            
            <img
              src={message.fileUrl}
              alt={message.fileName}
              className="max-w-full max-h-full object-contain"
              style={{ transform: `scale(${zoom})` }}
            />
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              <button
                onClick={() => setZoom(Math.max(zoom / 1.2, 0.1))}
                className="w-10 h-10 bg-white bg-opacity-20 text-white rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
              >
                <MagnifyingGlassMinusIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setZoom(Math.min(zoom * 1.2, 5))}
                className="w-10 h-10 bg-white bg-opacity-20 text-white rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
              >
                <MagnifyingGlassPlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaSharing;
