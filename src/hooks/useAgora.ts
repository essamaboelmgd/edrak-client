import { useEffect, useRef, useState } from "react";
import AgoraRTC, { IAgoraRTCClient, ILocalAudioTrack, ILocalVideoTrack, IRemoteAudioTrack, IRemoteVideoTrack, UID } from "agora-rtc-sdk-ng";

interface UseAgoraOptions {
    appId: string;
    channel: string;
    token: string;
    screenToken?: string;
    uid?: UID;
    userName?: string;
    onUserJoined?: (uid: UID) => void;
    onUserLeft?: (uid: UID) => void;
}

export function useAgora({
    appId,
    channel,
    token,
    screenToken,
    uid,
    userName: _userName,
    onUserJoined,
    onUserLeft,
}: UseAgoraOptions) {
    const clientRef = useRef<IAgoraRTCClient | null>(null);
    const screenClientRef = useRef<IAgoraRTCClient | null>(null); // Separate client for screen share
    const screenClientUidRef = useRef<UID | null>(null);
    const [isJoined, setIsJoined] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [localAudioTrack, setLocalAudioTrack] = useState<ILocalAudioTrack | null>(null);
    const [localVideoTrack, setLocalVideoTrack] = useState<ILocalVideoTrack | null>(null);
    const [localScreenTrack, setLocalScreenTrack] = useState<ILocalVideoTrack | null>(null); // Separate screen track
    const [remoteUsers, setRemoteUsers] = useState<Map<UID, { audioTrack?: IRemoteAudioTrack; videoTrack?: IRemoteVideoTrack; screenTrack?: IRemoteVideoTrack; userName?: string; audioEnabled?: boolean; videoEnabled?: boolean }>>(new Map());
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    // Track muted state for remote users
    const [mutedUsers, setMutedUsers] = useState<Set<UID>>(new Set());
    // Track force-disabled video users
    const [videoDisabledUsers, setVideoDisabledUsers] = useState<Set<UID>>(new Set());
    // Speaking indicator state
    const [speakingUsers, setSpeakingUsers] = useState<Set<UID>>(new Set());
    const speakingTimersRef = useRef<Map<UID, any>>(new Map());
    // Admin global locks and blocked users
    const [blockedUsers, setBlockedUsers] = useState<Set<UID>>(new Set());

    // Initialize clients
    useEffect(() => {
        if (!clientRef.current) {
            clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
            screenClientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

            // Setup event listeners for main client (camera)
            clientRef.current.on("user-published", async (user, mediaType) => {
                try {
                    await clientRef.current!.subscribe(user, mediaType);

                    if (mediaType === "video") {
                        setRemoteUsers((prev) => {
                            const newMap = new Map(prev);
                            const existing = newMap.get(user.uid) || {};
                            // Check if this is a screen track by examining track properties
                            // Screen share tracks have specific properties in their MediaStreamTrack
                            let isScreenTrack = false;
                            try {
                                const mediaStreamTrack = (user.videoTrack as any).getMediaStreamTrack?.();
                                if (mediaStreamTrack) {
                                    const settings = mediaStreamTrack.getSettings?.();
                                    const label = mediaStreamTrack.label?.toLowerCase() || "";
                                    if (settings?.displaySurface ||
                                        label.includes("screen") ||
                                        label.includes("display") ||
                                        label.includes("window")) {
                                        isScreenTrack = true;
                                    }
                                }
                            } catch (err) {
                                // If detection fails, assume it's a camera track
                            }

                            if (isScreenTrack) {
                                newMap.set(user.uid, { ...existing, screenTrack: user.videoTrack });
                            } else {
                                newMap.set(user.uid, { ...existing, videoTrack: user.videoTrack, videoEnabled: true });
                            }
                            return newMap;
                        });
                    }

                    if (mediaType === "audio") {
                        setRemoteUsers((prev) => {
                            const newMap = new Map(prev);
                            const existing = newMap.get(user.uid) || {};
                            newMap.set(user.uid, { ...existing, audioTrack: user.audioTrack, audioEnabled: true });
                            return newMap;
                        });
                        user.audioTrack?.play();
                    }

                    if (onUserJoined) {
                        onUserJoined(user.uid);
                    }
                } catch (error) {
                    console.error("Error subscribing to user:", error);
                }
            });

            // Enable audio volume indicator and track active speakers
            try {
                (AgoraRTC as any).enableAudioVolumeIndicator?.();
                clientRef.current.on("volume-indicator", (volumes: Array<{ uid: UID; level: number }>) => {
                    const active = new Set<UID>();
                    volumes.forEach((v) => {
                        if (v.level >= 5) {
                            active.add(v.uid);
                            const prevTimer = speakingTimersRef.current.get(v.uid);
                            if (prevTimer) clearTimeout(prevTimer);
                            const t = setTimeout(() => {
                                setSpeakingUsers((prev) => {
                                    const n = new Set(prev);
                                    n.delete(v.uid);
                                    return n;
                                });
                                speakingTimersRef.current.delete(v.uid);
                            }, 1200);
                            speakingTimersRef.current.set(v.uid, t);
                        }
                    });
                    if (active.size > 0) {
                        setSpeakingUsers((prev) => {
                            const n = new Set(prev);
                            active.forEach((u) => n.add(u));
                            return n;
                        });
                    }
                });
            } catch (e) {
                // ignore
            }

            // Handle incoming control messages (mirror state locally)
            clientRef.current.on("stream-message", (_uid: UID, _streamId: number, message: Uint8Array) => {
                try {
                    // Convert Uint8Array to string if needed, or assume it's text. 
                    // Agora web sdk sends Uint8Array.
                    const text = new TextDecoder().decode(message);
                    const payload = JSON.parse(text);

                    if (payload.type === "block") {
                        setBlockedUsers((prev) => {
                            const n = new Set(prev);
                            n.add(payload.uid);
                            return n;
                        });
                    }
                    if (payload.type === "unblock") {
                        setBlockedUsers((prev) => {
                            const n = new Set(prev);
                            n.delete(payload.uid);
                            return n;
                        });
                    }
                    if (payload.type === "status_update" && payload.uid !== undefined) {
                        setRemoteUsers((prev) => {
                            const newMap = new Map(prev);
                            const existing = newMap.get(payload.uid) || {};
                            newMap.set(payload.uid, {
                                ...existing,
                                audioEnabled: payload.audioEnabled !== undefined ? !!payload.audioEnabled : existing.audioEnabled,
                                videoEnabled: payload.videoEnabled !== undefined ? !!payload.videoEnabled : existing.videoEnabled,
                            });
                            return newMap;
                        });
                    }
                } catch {
                    // ignore malformed messages
                }
            });
            
            clientRef.current.on("user-unpublished", (user, mediaType) => {
                if (mediaType === "video") {
                    setRemoteUsers((prev) => {
                        const newMap = new Map(prev);
                        const existing = newMap.get(user.uid);
                        if (existing) {
                            const { videoTrack, ...rest } = existing;
                            const updated = { ...rest, videoEnabled: false };
                            if (Object.keys(updated).length === 0) {
                                newMap.delete(user.uid);
                            } else {
                                newMap.set(user.uid, updated);
                            }
                        }
                        return newMap;
                    });
                }

                if (mediaType === "audio") {
                    setRemoteUsers((prev) => {
                        const newMap = new Map(prev);
                        const existing = newMap.get(user.uid);
                        if (existing) {
                            const { audioTrack, ...rest } = existing;
                            const updated = { ...rest, audioEnabled: false };
                            if (Object.keys(updated).length === 0) {
                                newMap.delete(user.uid);
                            } else {
                                newMap.set(user.uid, updated);
                            }
                        }
                        return newMap;
                    });
                }
            });

            // Ensure users are visible even if they joined without publishing tracks
            clientRef.current.on("user-joined", (user) => {
                setRemoteUsers((prev) => {
                    const newMap = new Map(prev);
                    // Create an entry if not exists so user is shown with placeholders
                    if (!newMap.has(user.uid)) {
                        newMap.set(user.uid, {});
                    }
                    return newMap;
                });
                if (onUserJoined) {
                    onUserJoined(user.uid);
                }
            });

            clientRef.current.on("user-left", (user) => {
                setRemoteUsers((prev) => {
                    const newMap = new Map(prev);
                    newMap.delete(user.uid);
                    return newMap;
                });
                if (onUserLeft) {
                    onUserLeft(user.uid);
                }
            });
        }

        return () => {
            // Cleanup will be handled by leaveChannel
        };
    }, [onUserJoined, onUserLeft]);

    const joinChannel = async () => {
        if (!clientRef.current || !screenClientRef.current) return;

        // Check connection state to prevent duplicate joins
        const connectionState = clientRef.current.connectionState;
        if (connectionState === "CONNECTED" || connectionState === "CONNECTING" || isJoined) {
            console.log("Already connected or connecting, skipping join");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Join main channel (for camera and audio)
            await clientRef.current.join(appId, channel, token, uid || null);

            // Join screen share channel (legacy logic used separate client)
            const screenShareToken = screenToken || token;
            const screenUid = await screenClientRef.current.join(appId, channel, screenShareToken, 0); // 0 or separate UID
            screenClientUidRef.current = screenUid;

            // Create local tracks
            const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            const videoTrack = await AgoraRTC.createCameraVideoTrack();

            setLocalAudioTrack(audioTrack);
            setLocalVideoTrack(videoTrack);

            // Publish tracks first (must be enabled to publish)
            await clientRef.current.publish([audioTrack, videoTrack]);

            // Then disable tracks by default (microphone and camera off)
            await audioTrack.setEnabled(false);
            await videoTrack.setEnabled(false);

            setIsJoined(true);
        } catch (err: any) {
            console.error("Error joining channel:", err);
            if (err.code === "INVALID_OPERATION" && err.message?.includes("already")) {
                setIsJoined(true);
                return;
            }
            setError(err.message || "Failed to join channel");
        } finally {
            setIsLoading(false);
        }
    };

    const leaveChannel = async () => {
        if (!clientRef.current || !isJoined) return;

        setIsLoading(true);

        try {
            if (localAudioTrack) {
                localAudioTrack.stop();
                localAudioTrack.close();
                setLocalAudioTrack(null);
            }

            if (localVideoTrack) {
                localVideoTrack.stop();
                localVideoTrack.close();
                setLocalVideoTrack(null);
            }

            if (localScreenTrack) {
                localScreenTrack.stop();
                localScreenTrack.close();
                setLocalScreenTrack(null);
            }

            await clientRef.current.leave();
            if (screenClientRef.current) {
                await screenClientRef.current.leave();
            }
            screenClientUidRef.current = null;

            setIsJoined(false);
            setIsScreenSharing(false);
            setRemoteUsers(new Map());
        } catch (err: any) {
            console.error("Error leaving channel:", err);
            setError(err.message || "Failed to leave channel");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAudio = async () => {
        if (!localAudioTrack) return;
        try {
            const newState = !isAudioEnabled;
            await localAudioTrack.setEnabled(newState);
            setIsAudioEnabled(newState);
        } catch (err) {
            console.error("Error toggling audio:", err);
        }
    };

    const toggleVideo = async () => {
        if (!localVideoTrack) return;
        try {
            const newState = !isVideoEnabled;
            await localVideoTrack.setEnabled(newState);
            setIsVideoEnabled(newState);
        } catch (err) {
            console.error("Error toggling video:", err);
        }
    };

    const toggleScreenShare = async () => {
        if (!screenClientRef.current || !isJoined) return;

        try {
            if (localScreenTrack) {
                await localScreenTrack.stop();
                await localScreenTrack.close();
                await screenClientRef.current.unpublish(localScreenTrack);
                setLocalScreenTrack(null);
                setIsScreenSharing(false);
            } else {
                const screenTrackResult = await AgoraRTC.createScreenVideoTrack({
                     encoderConfig: "1080p_1",
                     optimizationMode: "detail",
                }, "auto"); // use auto to include system audio if supported

                const screenTrack = Array.isArray(screenTrackResult) ? screenTrackResult[0] : screenTrackResult;
                
                setLocalScreenTrack(screenTrack);
                await screenClientRef.current.publish(screenTrack);
                setIsScreenSharing(true);
            }
        } catch (err: any) {
            console.error("Error toggling screen share:", err);
            setError(err.message || "Failed to toggle screen share");
        }
    };

    // Admin Controls Stubs (need real logic or just minimal state updates)
    const muteUser = async (targetUid: UID) => {
        setMutedUsers(prev => new Set(prev).add(targetUid));
    };
    const unmuteUser = async (targetUid: UID) => {
        setMutedUsers(prev => {
            const n = new Set(prev);
            n.delete(targetUid);
            return n;
        });
    };
    const stopUserVideo = async (targetUid: UID) => {
        setVideoDisabledUsers(prev => new Set(prev).add(targetUid));
    };
    const allowUserVideo = async (targetUid: UID) => {
        setVideoDisabledUsers(prev => {
            const n = new Set(prev);
            n.delete(targetUid);
            return n;
        });
    };
    const blockUser = async (targetUid: UID) => {
        setBlockedUsers(prev => new Set(prev).add(targetUid));
    };
    const unblockUser = async (targetUid: UID) => {
        setBlockedUsers(prev => {
            const n = new Set(prev);
            n.delete(targetUid);
            return n;
        });
    };
    const muteAllUsers = async () => { /* Impl */ };
    const unmuteAllUsers = async () => { /* Impl */ };
    const disableAllVideos = async () => { /* Impl */ };
    const enableAllVideos = async () => { /* Impl */ };


    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (localAudioTrack) localAudioTrack.close();
            if (localVideoTrack) localVideoTrack.close();
            if (localScreenTrack) localScreenTrack.close();
            if (clientRef.current && isJoined) clientRef.current.leave();
            if (screenClientRef.current && isJoined) screenClientRef.current.leave();
        };
    }, []);

    return {
        isJoined,
        isLoading,
        error,
        localAudioTrack,
        localVideoTrack,
        localScreenTrack,
        localAudioTrack_unused: localAudioTrack,
        // remoteUsers: Array.from(remoteUsers.values()).map(u => ({...u, uid: 0})), // Basic struct for now REMOVE DUPLICATE
        // But remoteUsers needs to be iterate-able with UIDs. 
        // Let's expose remoteUsers as generic array with UIDs
        remoteUsersList: Array.from(remoteUsers.entries()).map(([uid, data]) => ({ uid, ...data })), 
        // Keeping legacy return signature as much as possible
        remoteUsers: Array.from(remoteUsers.entries()).map(([uid, data]) => ({ uid, ...data })),
        
        isAudioEnabled,
        isVideoEnabled,
        isScreenSharing,
        speakingUsers,
        joinChannel,
        leaveChannel,
        toggleAudio,
        toggleVideo,
        toggleScreenShare,
        muteAllUsers,
        unmuteAllUsers,
        disableAllVideos,
        enableAllVideos,
        mutedUsers,
        videoDisabledUsers,
        muteUser,
        unmuteUser,
        stopUserVideo,
        allowUserVideo,
        blockUser,
        unblockUser,
        blockedUsers,
        screenClientUid: screenClientUidRef.current,
    };
}
