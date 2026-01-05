import { useEffect, useRef } from "react";
import {
  Box,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
  Grid,
  IconButton,
} from "@chakra-ui/react";
import { Icon } from "@iconify-icon/react";
import { useAgora } from "@/hooks/useAgora";
import { useAuth } from "@/contexts/AuthContext";
import { io, Socket } from "socket.io-client";

interface AgoraMeetingRoomProps {
  isOpen: boolean;
  onClose: () => void;
  appId: string;
  channel: string;
  token: string;
  screenToken?: string;
  uid?: number | string;
  liveId?: number | string;
}

export default function AgoraMeetingRoom({
  isOpen,
  onClose,
  appId,
  channel,
  token,
  screenToken,
  uid,
}: AgoraMeetingRoomProps) {
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRefs = useRef<Map<number | string, HTMLDivElement>>(new Map());
  const toast = useToast();
  
  const { user } = useAuth();
  // Safe name construction
  const userName = user ? `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() || user.email || "User" : "Admin";

  const isSidebarOpen = true;
  const focusedVideo = null;
  
  // Determine socket URL - use window.location.origin or env
  const socketServerUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const socketRef = useRef<Socket | null>(null);

  const {
    isJoined,
    isLoading,
    localVideoTrack,
    remoteUsers,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    joinChannel,
    leaveChannel,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    screenClientUid,
  } = useAgora({
    appId,
    channel,
    token,
    screenToken,
    uid,
    userName: userName,
    onUserJoined: (uid) => { console.log("User Joined:", uid) },
    onUserLeft: (uid) => { console.log("User Left:", uid) },
  });

  // Join on open
  useEffect(() => {
    if (isOpen && !isJoined && !isLoading) {
      joinChannel();
    }
  }, [isOpen, isJoined, isLoading]); // Only join once ideally

  // Socket setup
  useEffect(() => {
    if (!isJoined || !channel) return;

    const socket = io(socketServerUrl, {
      transports: ["websocket"],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
        socket.emit("join-meeting", {
            meetingId: channel,
            userName: userName,
            uid,
        });
        toast({ title: "Connected to chat/control server", status: "success" });
    });

    return () => {
        if (socket.connected) socket.disconnect();
    };
  }, [isJoined, channel, uid]);

  // Local Video Display
  useEffect(() => {
    if (localVideoTrack && localVideoRef.current && isJoined) {
        if (focusedVideo !== 'local' && focusedVideo !== 'screen' && !isScreenSharing) {
            localVideoTrack.play(localVideoRef.current);
        }
        return () => { localVideoTrack.stop(); };
    }
  }, [localVideoTrack, isJoined, focusedVideo, isScreenSharing]);

  // Remote Videos Display
  useEffect(() => {
      remoteUsers.forEach(user => {
          if (user.uid === uid) return;
          if (user.uid === screenClientUid) return;
          
          if (user.videoTrack) {
              const container = remoteVideoRefs.current.get(user.uid);
              if (container) {
                  user.videoTrack.play(container);
              }
          }
           if (user.audioTrack) {
              user.audioTrack.play();
          }
      });
  }, [remoteUsers, uid, screenClientUid]);
  
  // Clean close
  const handleClose = async () => {
      await leaveChannel();
      onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="full" closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent bg="gray.900" color="white">
        <ModalHeader>Live Meeting: {channel}</ModalHeader>
        <ModalCloseButton />
        <ModalBody p={0} display="flex">
            {/* Main Content */}
            <Box flex={1} position="relative" bg="black">
                {/* Main/Central Video Area */}
                <Box w="full" h="full" display="flex" alignItems="center" justifyContent="center">
                    {/* Placeholder for now showing default behavior or focused */}
                     {!focusedVideo && (
                         <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4} w="full" h="full" p={4}>
                             {/* Local User */}
                             <Box 
                                borderRadius="lg" overflow="hidden" bg="gray.800" position="relative"
                                ref={localVideoRef} h="300px" border="2px solid blue"
                            >
                                <Text position="absolute" bottom={2} left={2} bg="blackAlpha.600" p={1} borderRadius="md">You</Text>
                            </Box>
                            
                            {/* Remote Users */}
                            {remoteUsers.map(user => (
                                <Box key={user.uid} 
                                    borderRadius="lg" overflow="hidden" bg="gray.800" position="relative"
                                    h="300px"
                                    ref={(el) => {
                                        if (el) remoteVideoRefs.current.set(user.uid, el);
                                        else remoteVideoRefs.current.delete(user.uid);
                                    }}
                                >
                                     <Text position="absolute" bottom={2} left={2} bg="blackAlpha.600" p={1} borderRadius="md">User {user.uid}</Text>
                                </Box>
                            ))}
                         </Grid>
                     )}
                </Box>
                
                {/* Controls Bar */}
                 <HStack 
                    position="absolute" bottom="20px" left="50%" transform="translateX(-50%)" 
                    bg="gray.800" p={4} borderRadius="full" spacing={4}
                 >
                    <IconButton 
                        aria-label="Toggle Mic" 
                        icon={<Icon icon={isAudioEnabled ? "solar:microphone-3-bold" : "solar:microphone-3-broken"} width="24" />}
                        colorScheme={isAudioEnabled ? "blue" : "red"}
                        onClick={toggleAudio}
                        isRound
                    />
                     <IconButton 
                        aria-label="Toggle Video" 
                        icon={<Icon icon={isVideoEnabled ? "solar:videocamera-record-bold" : "solar:videocamera-record-broken"} width="24" />}
                        colorScheme={isVideoEnabled ? "blue" : "red"}
                        onClick={toggleVideo}
                        isRound
                    />
                     <IconButton 
                        aria-label="Share Screen" 
                        icon={<Icon icon="solar:screen-share-bold" width="24" />}
                        colorScheme={isScreenSharing ? "green" : "gray"}
                        onClick={toggleScreenShare}
                        isRound
                    />
                     <Button colorScheme="red" onClick={handleClose}>
                        Leave
                    </Button>
                 </HStack>
            </Box>

            {/* Sidebar (Chat/Participants) */}
            {isSidebarOpen && (
                <Box w="300px" bg="gray.800" borderLeft="1px solid" borderColor="gray.700">
                    <Text p={4} fontWeight="bold">Participants ({remoteUsers.length + 1})</Text>
                     {/* Chat UI Placeholder */}
                    <Box flex={1} borderTop="1px solid gray">
                        <Text p={4}>Chat Area</Text>
                    </Box>
                </Box>
            )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
