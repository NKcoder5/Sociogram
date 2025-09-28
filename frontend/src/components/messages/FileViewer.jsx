import React, { useState, useRef, useEffect } from 'react';
import { 
  XMarkIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  DocumentTextIcon,
  EyeIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

const FileViewer = ({ 
  file, 
  files = [], 
  currentIndex = 0, 
  isOpen, 
  onClose, 
  onNavigate 
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfNumPages, setPdfNumPages] = useState(0);
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && file) {
      resetViewerState();
      loadFileContent();
    }
  }, [isOpen, file]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (files.length > 1) onNavigate('prev');
          break;
        case 'ArrowRight':
          if (files.length > 1) onNavigate('next');
          break;
        case '+':
        case '=':
          handleZoom('in');
          break;
        case '-':
          handleZoom('out');
          break;
        case 'r':
          handleRotate();
          break;
        case ' ':
          e.preventDefault();
          if (file?.type?.startsWith('video/') || file?.type?.startsWith('audio/')) {
            togglePlayPause();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, file, files.length]);

  const resetViewerState = () => {
    setZoom(1);
    setRotation(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setPdfPage(1);
    setPdfNumPages(0);
    setTextContent('');
  };

  const loadFileContent = async () => {
    if (!file) return;

    setLoading(true);
    try {
      if (file.type === 'text/plain') {
        const response = await fetch(file.url);
        const text = await response.text();
        setTextContent(text);
      } else if (file.type === 'application/pdf') {
        // PDF loading would require a PDF library like react-pdf
        // For now, we'll show a placeholder
        setPdfNumPages(1);
      }
    } catch (error) {
      console.error('Error loading file content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileType = () => {
    if (!file?.type) return 'unknown';
    
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type === 'text/plain') return 'text';
    if (file.type.includes('document') || file.type.includes('word')) return 'document';
    if (file.type.includes('spreadsheet') || file.type.includes('excel')) return 'spreadsheet';
    
    return 'unknown';
  };

  const handleZoom = (direction) => {
    const fileType = getFileType();
    if (!['image', 'pdf'].includes(fileType)) return;
    
    setZoom(prev => {
      if (direction === 'in') {
        return Math.min(prev * 1.2, 5);
      } else {
        return Math.max(prev / 1.2, 0.1);
      }
    });
  };

  const handleRotate = () => {
    const fileType = getFileType();
    if (fileType !== 'image') return;
    
    setRotation(prev => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const togglePlayPause = () => {
    const fileType = getFileType();
    
    if (fileType === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    } else if (fileType === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (videoRef.current) videoRef.current.volume = newVolume;
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (videoRef.current) videoRef.current.muted = newMuted;
    if (audioRef.current) audioRef.current.muted = newMuted;
  };

  const handleTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime);
  };

  const handleLoadedMetadata = (e) => {
    setDuration(e.target.duration);
  };

  const handleSeek = (time) => {
    if (videoRef.current) videoRef.current.currentTime = time;
    if (audioRef.current) audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareFile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: file.name,
          url: file.url
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(file.url);
      alert('File URL copied to clipboard');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  if (!isOpen || !file) return null;

  const fileType = getFileType();

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black bg-opacity-95 flex flex-col z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold truncate max-w-md">{file.name}</h3>
          <span className="text-sm text-gray-300">
            {formatFileSize(file.size)} • {fileType.toUpperCase()}
          </span>
          {files.length > 1 && (
            <span className="text-sm text-gray-300">
              {currentIndex + 1} of {files.length}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Navigation */}
          {files.length > 1 && (
            <>
              <button
                onClick={() => onNavigate('prev')}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate('next')}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Zoom Controls */}
          {['image', 'pdf'].includes(fileType) && (
            <>
              <button
                onClick={() => handleZoom('out')}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <MagnifyingGlassMinusIcon className="w-5 h-5" />
              </button>
              <span className="text-sm px-2">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => handleZoom('in')}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <MagnifyingGlassPlusIcon className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            {isFullscreen ? (
              <ArrowsPointingInIcon className="w-5 h-5" />
            ) : (
              <ArrowsPointingOutIcon className="w-5 h-5" />
            )}
          </button>

          {/* Download */}
          <button
            onClick={downloadFile}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
          </button>

          {/* Share */}
          <button
            onClick={shareFile}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <ShareIcon className="w-5 h-5" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        {loading ? (
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading file...</p>
          </div>
        ) : (
          <>
            {/* Image Viewer */}
            {fileType === 'image' && (
              <img
                src={file.url}
                alt={file.name}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{ 
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  cursor: zoom > 1 ? 'grab' : 'default'
                }}
                draggable={false}
              />
            )}

            {/* Video Viewer */}
            {fileType === 'video' && (
              <div className="relative">
                <video
                  ref={videoRef}
                  src={file.url}
                  className="max-w-full max-h-full"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  controls
                />
              </div>
            )}

            {/* Audio Viewer */}
            {fileType === 'audio' && (
              <div className="bg-white bg-opacity-10 rounded-2xl p-8 text-white text-center">
                <audio
                  ref={audioRef}
                  src={file.url}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                
                <SpeakerWaveIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">{file.name}</h3>
                
                {/* Audio Controls */}
                <div className="flex items-center justify-center space-x-4 mt-6">
                  <button
                    onClick={togglePlayPause}
                    className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                  >
                    {isPlaying ? (
                      <PauseIcon className="w-6 h-6" />
                    ) : (
                      <PlayIcon className="w-6 h-6 ml-1" />
                    )}
                  </button>
                  
                  <button
                    onClick={toggleMute}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    {isMuted ? (
                      <SpeakerXMarkIcon className="w-5 h-5" />
                    ) : (
                      <SpeakerWaveIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Progress Bar */}
                {duration > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <span>{formatTime(currentTime)}</span>
                      <div className="flex-1 relative">
                        <div className="w-full h-2 bg-white bg-opacity-20 rounded-full">
                          <div 
                            className="h-2 bg-white rounded-full transition-all duration-150"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                          />
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={duration}
                          value={currentTime}
                          onChange={(e) => handleSeek(parseFloat(e.target.value))}
                          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                        />
                      </div>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Text Viewer */}
            {fileType === 'text' && (
              <div className="bg-white rounded-lg p-6 max-w-4xl max-h-full overflow-y-auto">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-900">
                  {textContent}
                </pre>
              </div>
            )}

            {/* PDF Viewer */}
            {fileType === 'pdf' && (
              <div className="bg-white rounded-lg p-4 max-w-4xl max-h-full">
                <div className="text-center mb-4">
                  <p className="text-gray-600">PDF Preview</p>
                  <p className="text-sm text-gray-500">
                    For full PDF viewing, please download the file
                  </p>
                </div>
                <iframe
                  src={file.url}
                  className="w-full h-96 border border-gray-300 rounded"
                  title={file.name}
                />
              </div>
            )}

            {/* Document Viewer */}
            {['document', 'spreadsheet'].includes(fileType) && (
              <div className="bg-white bg-opacity-10 rounded-2xl p-8 text-white text-center">
                <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">{file.name}</h3>
                <p className="text-gray-300 mb-6">
                  {fileType === 'document' ? 'Document file' : 'Spreadsheet file'}
                </p>
                
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={downloadFile}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    <span>Download</span>
                  </button>
                  
                  <button
                    onClick={() => window.open(file.url, '_blank')}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <EyeIcon className="w-5 h-5" />
                    <span>Open in Browser</span>
                  </button>
                </div>
              </div>
            )}

            {/* Unknown File Type */}
            {fileType === 'unknown' && (
              <div className="bg-white bg-opacity-10 rounded-2xl p-8 text-white text-center">
                <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">{file.name}</h3>
                <p className="text-gray-300 mb-6">
                  This file type cannot be previewed
                </p>
                
                <button
                  onClick={downloadFile}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mx-auto"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  <span>Download File</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-black bg-opacity-50 text-white text-center">
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-300">
          <span>Use arrow keys to navigate</span>
          <span>Press ESC to close</span>
          {['image', 'pdf'].includes(fileType) && (
            <span>Use +/- to zoom</span>
          )}
          {fileType === 'image' && (
            <span>Press R to rotate</span>
          )}
          {['video', 'audio'].includes(fileType) && (
            <span>Press Space to play/pause</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
