import { Box, AspectRatio } from "@chakra-ui/react";
import ReactPlayer from "react-player";
import { useState, useRef } from "react";
// Cast ReactPlayer to any to avoid type issues with prop definitions
const Player = ReactPlayer as any;


// Helper to detect provider from URL if not explicitly provided
const detectProvider = (url: string): 'youtube' | 'vimeo' | 'bunny' | 'custom' => {
    if (!url) return 'custom';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    if (url.includes('bunny.net') || url.includes('mediadelivery.net') || url.includes('bunnycdn.com')) return 'bunny';
    return 'custom';
};

interface VideoPlayerProps {
    url: string;
    provider?: 'youtube' | 'vimeo' | 'bunny' | 'custom';
    title?: string; // For iframe title
    onStart?: () => void;
    onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
    onEnded?: () => void;
}

export default function VideoPlayer({ url, provider, title, onStart, onProgress, onEnded }: VideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const hasStartedRef = useRef(false);

    const activeProvider = provider || detectProvider(url);

    const handleStart = () => {
        setIsPlaying(true);
        if (!hasStartedRef.current) {
            hasStartedRef.current = true;
            onStart?.();
        }
    };

    // Bunny Player (Stream) - typically an iframe
    if (activeProvider === 'bunny') {
        return (
            <AspectRatio ratio={16 / 9} width="100%">
                <Box bg="black" borderRadius="lg" overflow="hidden" position="relative">
                    <iframe 
                        src={url} 
                        width="100%" 
                        height="100%" 
                        title={title || "Video player"}
                        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" 
                        allowFullScreen
                        style={{ border: 'none', position: 'absolute', top: 0, left: 0 }}
                        onLoad={handleStart} // Not exact "start" but close enough for iframe load
                    />
                </Box>
            </AspectRatio>
        );
    }

    // Default ReactPlayer (YouTube, Vimeo, Files)
    return (
        <AspectRatio ratio={16 / 9} width="100%">
            <Box bg="black" borderRadius="lg" overflow="hidden" position="relative" className="player-wrapper">
                <Player
                    url={url}
                    width="100%"
                    height="100%"
                    controls
                    playing={isPlaying}
                    onStart={handleStart}
                    onPlay={handleStart}
                    onProgress={onProgress}
                    onEnded={onEnded}
                    config={{
                        youtube: {
                            playerVars: { showinfo: 0 }
                        },
                        vimeo: {
                            playerOptions: {
                                byline: false,
                                portrait: false,
                                title: false
                            }
                        }
                    }}
                    style={{ position: 'absolute', top: 0, left: 0 }}
                />
                 {/* Custom Play Button Overlay if needed, though ReactPlayer's light mode is better for that. 
                     For now, we stick to standard controls to match legacy simple implementation, 
                     but legacy VideoPlayer had a custom button. If we want that "wow" factor:
                  */}
            </Box>
        </AspectRatio>
    );
}
