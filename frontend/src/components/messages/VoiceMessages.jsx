import React, { useState, useRef, useEffect } from 'react';
import { 
  MicrophoneIcon, 
  StopIcon, 
  PlayIcon, 
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  TrashIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { messageAPI } from '../../utils/api';

const VoiceMessages = ({ 
  onVoiceMessageSend, 
  isRecording, 
  setIsRecording,
  audioBlob,
  setAudioBlob 
}) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioWaveform, setAudioWaveform] = useState([]);
  const [recordingQuality, setRecordingQuality] = useState('high');
  
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const playbackIntervalRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);

  const qualitySettings = {
    low: { sampleRate: 22050, bitRate: 32000 },
    medium: { sampleRate: 44100, bitRate: 64000 },
    high: { sampleRate: 48000, bitRate: 128000 }
  };

  useEffect(() => {
    // ESC key handler for voice recording
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isRecording) {
        stopRecording();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      // Cleanup
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const constraints = {
        audio: {
          sampleRate: qualitySettings[recordingQuality].sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Setup audio context for waveform visualization
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Start waveform animation
      const drawWaveform = () => {
        if (!isRecording) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const waveform = Array.from(dataArray).slice(0, 32).map(value => value / 255);
        setAudioWaveform(waveform);
        
        requestAnimationFrame(drawWaveform);
      };
      drawWaveform();

      // Setup MediaRecorder
      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: qualitySettings[recordingQuality].bitRate
      };

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        // Create audio URL for playback
        const audioUrl = URL.createObjectURL(blob);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.onloadedmetadata = () => {
            setDuration(audioRef.current.duration);
          };
        }
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Recording error:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            track.stop();
            console.log('Voice recording track stopped');
          });
        }
        
        // Close audio context
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
        
        setIsRecording(false);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
        setAudioWaveform([]);
        
        console.log('Voice recording stopped successfully');
      } catch (error) {
        console.error('Error stopping voice recording:', error);
        // Force reset state even if stop fails
        setIsRecording(false);
        setAudioWaveform([]);
      }
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.play();
      setIsPlaying(true);
      
      // Start playback timer
      playbackIntervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setPlaybackTime(audioRef.current.currentTime);
          
          if (audioRef.current.ended) {
            setIsPlaying(false);
            setPlaybackTime(0);
            clearInterval(playbackIntervalRef.current);
          }
        }
      }, 100);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      clearInterval(playbackIntervalRef.current);
    }
  };

  const seekAudio = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setPlaybackTime(time);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume : 0;
    }
  };

  const changeVolume = (newVolume) => {
    setVolume(newVolume);
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = newVolume;
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    setPlaybackTime(0);
    setDuration(0);
    setIsPlaying(false);
    setAudioWaveform([]);
    
    if (audioRef.current) {
      audioRef.current.src = '';
    }
  };

  const downloadRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voice-message-${new Date().toISOString()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const sendVoiceMessage = async () => {
    if (audioBlob && onVoiceMessageSend) {
      await onVoiceMessageSend(audioBlob);
      deleteRecording();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const WaveformVisualizer = ({ waveform, isActive = false }) => (
    <div className="flex items-center justify-center space-x-1 h-8">
      {(waveform.length > 0 ? waveform : Array(32).fill(0)).map((value, index) => (
        <div
          key={index}
          className={`w-1 bg-gradient-to-t transition-all duration-150 ${
            isActive 
              ? 'from-red-400 to-red-600' 
              : 'from-purple-400 to-purple-600'
          }`}
          style={{ 
            height: `${Math.max(2, value * 32)}px`,
            opacity: isActive ? 0.8 + (value * 0.2) : 0.6
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="voice-messages-container">
      <audio ref={audioRef} />
      
      {/* Recording Interface */}
      {isRecording && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <MicrophoneIcon className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Recording...</h3>
              <p className="text-3xl font-mono text-red-600 mb-6">{formatTime(recordingTime)}</p>
              
              {/* Live Waveform */}
              <div className="mb-6">
                <WaveformVisualizer waveform={audioWaveform} isActive={true} />
              </div>
              
              {/* Recording Quality */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quality</label>
                <select
                  value={recordingQuality}
                  onChange={(e) => setRecordingQuality(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={isRecording}
                >
                  <option value="low">Low (32kbps)</option>
                  <option value="medium">Medium (64kbps)</option>
                  <option value="high">High (128kbps)</option>
                </select>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={stopRecording}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
                >
                  <StopIcon className="w-5 h-5 inline mr-2" />
                  Stop Recording
                </button>
              </div>
              
              <div className="text-center mt-4">
                <p className="text-xs text-gray-500">Press ESC to cancel recording</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice Message Preview */}
      {audioBlob && !isRecording && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-purple-900">🎤 Voice Message Ready</h4>
            <span className="text-sm text-purple-700">{formatTime(duration)}</span>
          </div>
          
          {/* Waveform Display */}
          <div className="mb-4">
            <WaveformVisualizer waveform={audioWaveform} />
          </div>
          
          {/* Playback Controls */}
          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={isPlaying ? pauseAudio : playAudio}
              className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
            >
              {isPlaying ? (
                <PauseIcon className="w-5 h-5" />
              ) : (
                <PlayIcon className="w-5 h-5 ml-0.5" />
              )}
            </button>
            
            {/* Progress Bar */}
            <div className="flex-1">
              <div className="relative">
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-150"
                    style={{ width: `${duration > 0 ? (playbackTime / duration) * 100 : 0}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={playbackTime}
                  onChange={(e) => seekAudio(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatTime(playbackTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isMuted ? (
                  <SpeakerXMarkIcon className="w-4 h-4" />
                ) : (
                  <SpeakerWaveIcon className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={deleteRecording}
              className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
              <span className="text-sm">Delete</span>
            </button>
            
            <button
              onClick={downloadRecording}
              className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span className="text-sm">Download</span>
            </button>
            
            <button
              onClick={sendVoiceMessage}
              className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 font-medium"
            >
              Send Voice Message
            </button>
          </div>
        </div>
      )}

      {/* Recording Button */}
      {!audioBlob && !isRecording && (
        <button
          onClick={startRecording}
          className="p-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <MicrophoneIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

// Voice Message Display Component for received messages
export const VoiceMessageDisplay = ({ message, isOwn = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef(null);
  const playbackIntervalRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && message.fileUrl) {
      audioRef.current.src = message.fileUrl;
      audioRef.current.onloadedmetadata = () => {
        setDuration(audioRef.current.duration);
      };
    }
    
    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, [message.fileUrl]);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.play();
      setIsPlaying(true);
      
      playbackIntervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setPlaybackTime(audioRef.current.currentTime);
          
          if (audioRef.current.ended) {
            setIsPlaying(false);
            setPlaybackTime(0);
            clearInterval(playbackIntervalRef.current);
          }
        }
      }, 100);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      clearInterval(playbackIntervalRef.current);
    }
  };

  const seekAudio = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setPlaybackTime(time);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`voice-message-display p-3 rounded-xl max-w-xs ${
      isOwn 
        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' 
        : 'bg-white border border-gray-200 text-gray-900'
    }`}>
      <audio ref={audioRef} />
      
      <div className="flex items-center space-x-3">
        <button
          onClick={isPlaying ? pauseAudio : playAudio}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isOwn 
              ? 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white' 
              : 'bg-purple-100 hover:bg-purple-200 text-purple-600'
          }`}
        >
          {isPlaying ? (
            <PauseIcon className="w-4 h-4" />
          ) : (
            <PlayIcon className="w-4 h-4 ml-0.5" />
          )}
        </button>
        
        <div className="flex-1">
          {/* Waveform placeholder */}
          <div className="flex items-center space-x-0.5 mb-1">
            {Array(20).fill(0).map((_, i) => (
              <div
                key={i}
                className={`w-0.5 rounded-full transition-all duration-150 ${
                  isOwn ? 'bg-white bg-opacity-60' : 'bg-purple-300'
                }`}
                style={{ 
                  height: `${Math.random() * 16 + 4}px`,
                  opacity: (playbackTime / duration) > (i / 20) ? 1 : 0.3
                }}
              />
            ))}
          </div>
          
          {/* Progress */}
          <div className="relative">
            <div className={`w-full h-1 rounded-full ${
              isOwn ? 'bg-white bg-opacity-20' : 'bg-gray-200'
            }`}>
              <div 
                className={`h-1 rounded-full transition-all duration-150 ${
                  isOwn ? 'bg-white' : 'bg-purple-500'
                }`}
                style={{ width: `${duration > 0 ? (playbackTime / duration) * 100 : 0}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max={duration}
              value={playbackTime}
              onChange={(e) => seekAudio(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer"
            />
          </div>
          
          <div className="flex justify-between text-xs mt-1">
            <span className={isOwn ? 'text-white text-opacity-80' : 'text-gray-500'}>
              {formatTime(playbackTime)}
            </span>
            <span className={isOwn ? 'text-white text-opacity-80' : 'text-gray-500'}>
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceMessages;
