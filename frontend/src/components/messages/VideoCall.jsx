import React, { useState, useRef, useEffect } from 'react';
import { 
  VideoCameraIcon, 
  PhoneIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  CameraIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  Cog6ToothIcon,
  UserIcon,
  SignalIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  VideoCameraSlashIcon,
  SpeakerXMarkIcon,
  PhoneXMarkIcon
} from '@heroicons/react/24/solid';

const VideoCall = ({ 
  socket, 
  user, 
  selectedConversation, 
  isInCall, 
  setIsInCall, 
  callType, 
  setCallType 
}) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, ringing, connected, ended
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedMicrophone, setSelectedMicrophone] = useState('');
  const [availableDevices, setAvailableDevices] = useState({
    cameras: [],
    microphones: [],
    speakers: []
  });

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const callTimerRef = useRef(null);
  const containerRef = useRef(null);

  // WebRTC Configuration
  const rtcConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10
  };

  useEffect(() => {
    // Get available media devices
    getAvailableDevices();
    
    // Socket event listeners
    if (socket) {
      socket.on('incomingCall', handleIncomingCall);
      socket.on('callAccepted', handleCallAccepted);
      socket.on('callRejected', handleCallRejected);
      socket.on('callEnded', handleCallEnded);
      socket.on('iceCandidate', handleIceCandidate);
      socket.on('offer', handleOffer);
      socket.on('answer', handleAnswer);
    }

    return () => {
      if (socket) {
        socket.off('incomingCall');
        socket.off('callAccepted');
        socket.off('callRejected');
        socket.off('callEnded');
        socket.off('iceCandidate');
        socket.off('offer');
        socket.off('answer');
      }
      
      endCall();
    };
  }, [socket]);

  useEffect(() => {
    if (isInCall && callStatus === 'connected') {
      startCallTimer();
    } else {
      stopCallTimer();
    }
  }, [isInCall, callStatus]);

  const getAvailableDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      const microphones = devices.filter(device => device.kind === 'audioinput');
      const speakers = devices.filter(device => device.kind === 'audiooutput');
      
      setAvailableDevices({ cameras, microphones, speakers });
      
      if (cameras.length > 0 && !selectedCamera) {
        setSelectedCamera(cameras[0].deviceId);
      }
      if (microphones.length > 0 && !selectedMicrophone) {
        setSelectedMicrophone(microphones[0].deviceId);
      }
    } catch (error) {
      console.error('Error getting devices:', error);
    }
  };

  const startCall = async (type) => {
    if (!selectedConversation) return;
    
    setCallType(type);
    setCallStatus('calling');
    setIsInCall(true);
    
    try {
      await initializeLocalStream(type === 'video');
      await createPeerConnection();
      
      const otherUser = selectedConversation.participants?.find(p => p.user.id !== user.id)?.user;
      if (socket && otherUser) {
        socket.emit('startCall', {
          to: otherUser.id,
          callType: type,
          from: { id: user.id, username: user.username }
        });
      }
    } catch (error) {
      console.error('Error starting call:', error);
      endCall();
    }
  };

  const initializeLocalStream = async (includeVideo = true) => {
    try {
      const constraints = {
        audio: {
          deviceId: selectedMicrophone ? { exact: selectedMicrophone } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: includeVideo ? {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  };

  const createPeerConnection = async () => {
    const peerConnection = new RTCPeerConnection(rtcConfiguration);
    peerConnectionRef.current = peerConnection;

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        const otherUser = selectedConversation.participants?.find(p => p.user.id !== user.id)?.user;
        socket.emit('iceCandidate', {
          to: otherUser.id,
          candidate: event.candidate
        });
      }
    };

    // Monitor connection state
    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      console.log('Connection state:', state);
      
      if (state === 'connected') {
        setCallStatus('connected');
        setConnectionQuality('good');
      } else if (state === 'disconnected' || state === 'failed') {
        setConnectionQuality('poor');
      }
    };

    return peerConnection;
  };

  const handleIncomingCall = ({ from, callType }) => {
    setCallStatus('ringing');
    setCallType(callType);
    
    const accept = window.confirm(
      `Incoming ${callType} call from ${from.username}. Accept?`
    );
    
    if (accept) {
      acceptCall();
    } else {
      rejectCall(from.id);
    }
  };

  const acceptCall = async () => {
    setIsInCall(true);
    setCallStatus('connected');
    
    try {
      await initializeLocalStream(callType === 'video');
      await createPeerConnection();
      
      if (socket) {
        socket.emit('acceptCall');
      }
    } catch (error) {
      console.error('Error accepting call:', error);
      endCall();
    }
  };

  const rejectCall = (callerId) => {
    if (socket) {
      socket.emit('rejectCall', { to: callerId });
    }
    setCallStatus('idle');
  };

  const handleCallAccepted = async () => {
    setCallStatus('connected');
    
    if (peerConnectionRef.current) {
      try {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        
        const otherUser = selectedConversation.participants?.find(p => p.user.id !== user.id)?.user;
        if (socket && otherUser) {
          socket.emit('offer', {
            to: otherUser.id,
            offer: offer
          });
        }
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    }
  };

  const handleOffer = async ({ offer, from }) => {
    if (peerConnectionRef.current) {
      try {
        await peerConnectionRef.current.setRemoteDescription(offer);
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        
        if (socket) {
          socket.emit('answer', {
            to: from,
            answer: answer
          });
        }
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    }
  };

  const handleAnswer = async ({ answer }) => {
    if (peerConnectionRef.current) {
      try {
        await peerConnectionRef.current.setRemoteDescription(answer);
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    }
  };

  const handleIceCandidate = async ({ candidate }) => {
    if (peerConnectionRef.current) {
      try {
        await peerConnectionRef.current.addIceCandidate(candidate);
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  };

  const handleCallRejected = () => {
    setCallStatus('idle');
    setIsInCall(false);
    endCall();
  };

  const handleCallEnded = () => {
    setCallStatus('ended');
    setTimeout(() => {
      setIsInCall(false);
      setCallStatus('idle');
    }, 2000);
    endCall();
  };

  const endCall = () => {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Emit end call event
    if (socket && callStatus !== 'idle') {
      const otherUser = selectedConversation.participants?.find(p => p.user.id !== user.id)?.user;
      if (otherUser) {
        socket.emit('endCall', { to: otherUser.id });
      }
    }

    setRemoteStream(null);
    setIsInCall(false);
    setCallStatus('idle');
    setCallDuration(0);
    stopCallTimer();
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerEnabled(!isSpeakerEnabled);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = isSpeakerEnabled;
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const switchCamera = async () => {
    if (localStream && availableDevices.cameras.length > 1) {
      const currentCameraIndex = availableDevices.cameras.findIndex(
        camera => camera.deviceId === selectedCamera
      );
      const nextCameraIndex = (currentCameraIndex + 1) % availableDevices.cameras.length;
      const nextCamera = availableDevices.cameras[nextCameraIndex];
      
      setSelectedCamera(nextCamera.deviceId);
      
      try {
        const videoTrack = localStream.getVideoTracks()[0];
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: nextCamera.deviceId } },
          audio: false
        });
        
        const newVideoTrack = newStream.getVideoTracks()[0];
        
        // Replace video track in peer connection
        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders().find(
            s => s.track && s.track.kind === 'video'
          );
          if (sender) {
            await sender.replaceTrack(newVideoTrack);
          }
        }
        
        // Replace track in local stream
        localStream.removeTrack(videoTrack);
        localStream.addTrack(newVideoTrack);
        videoTrack.stop();
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      } catch (error) {
        console.error('Error switching camera:', error);
      }
    }
  };

  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  };

  const formatCallDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-green-400';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (!isInCall) {
    // Call initiation buttons
    return (
      <div className="flex space-x-2">
        <button
          onClick={() => startCall('audio')}
          className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
          title="Audio Call"
        >
          <PhoneIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => startCall('video')}
          className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
          title="Video Call"
        >
          <VideoCameraIcon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 bg-black z-50 flex flex-col ${
        isFullscreen ? 'fullscreen' : ''
      }`}
    >
      {/* Call Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black to-transparent p-6">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold">
                  {selectedConversation?.participants?.find(p => p.user.id !== user.id)?.user?.username}
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <SignalIcon className={`w-4 h-4 ${getConnectionQualityColor()}`} />
                  <span className="capitalize">{connectionQuality}</span>
                  {callStatus === 'connected' && (
                    <>
                      <span>•</span>
                      <ClockIcon className="w-4 h-4" />
                      <span>{formatCallDuration(callDuration)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              {isFullscreen ? (
                <ArrowsPointingInIcon className="w-5 h-5" />
              ) : (
                <ArrowsPointingOutIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-20 right-6 bg-white rounded-lg shadow-xl p-4 z-20 w-80">
          <h3 className="font-semibold text-gray-900 mb-4">Call Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Camera</label>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableDevices.cameras.map(camera => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Microphone</label>
              <select
                value={selectedMicrophone}
                onChange={(e) => setSelectedMicrophone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableDevices.microphones.map(mic => (
                  <option key={mic.deviceId} value={mic.deviceId}>
                    {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Video Container */}
      <div className="flex-1 relative">
        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Local Video */}
        <div className="absolute top-6 right-6 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoCameraSlashIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Call Status Overlay */}
        {callStatus !== 'connected' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                {callStatus === 'calling' && <PhoneIcon className="w-10 h-10 animate-pulse" />}
                {callStatus === 'ringing' && <PhoneIcon className="w-10 h-10 animate-bounce" />}
                {callStatus === 'ended' && <PhoneXMarkIcon className="w-10 h-10" />}
              </div>
              <p className="text-xl font-semibold mb-2">
                {callStatus === 'calling' && 'Calling...'}
                {callStatus === 'ringing' && 'Incoming Call'}
                {callStatus === 'ended' && 'Call Ended'}
              </p>
              <p className="text-gray-300">
                {selectedConversation?.participants?.find(p => p.user.id !== user.id)?.user?.username}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
        <div className="flex items-center justify-center space-x-6">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isAudioEnabled 
                ? 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            <MicrophoneIcon className="w-6 h-6" />
          </button>

          {/* Video Toggle */}
          {callType === 'video' && (
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isVideoEnabled 
                  ? 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isVideoEnabled ? (
                <VideoCameraIcon className="w-6 h-6" />
              ) : (
                <VideoCameraSlashIcon className="w-6 h-6" />
              )}
            </button>
          )}

          {/* Camera Switch */}
          {callType === 'video' && availableDevices.cameras.length > 1 && (
            <button
              onClick={switchCamera}
              className="w-12 h-12 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white flex items-center justify-center transition-colors"
            >
              <CameraIcon className="w-6 h-6" />
            </button>
          )}

          {/* Speaker Toggle */}
          <button
            onClick={toggleSpeaker}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isSpeakerEnabled 
                ? 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {isSpeakerEnabled ? (
              <SpeakerWaveIcon className="w-6 h-6" />
            ) : (
              <SpeakerXMarkIcon className="w-6 h-6" />
            )}
          </button>

          {/* End Call */}
          <button
            onClick={endCall}
            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-lg"
          >
            <PhoneXMarkIcon className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
