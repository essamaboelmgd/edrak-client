import { Box, AspectRatio } from "@chakra-ui/react";
import ReactPlayer from "react-player";

// Cast ReactPlayer to any to avoid type issues with prop definitions
const Player = ReactPlayer as any;

interface VideoPlayerProps {
    url: string;
    onStart?: () => void;
    onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
    onEnded?: () => void;
}

export default function VideoPlayer({ url, onStart, onProgress, onEnded }: VideoPlayerProps) {
    return (
        <AspectRatio ratio={16 / 9} width="100%">
            <Box bg="black" borderRadius="lg" overflow="hidden">
                <Player
                    url={url}
                    width="100%"
                     height="100%"
                     controls
                     onStart={onStart}
                     onProgress={onProgress}
                     onEnded={onEnded}
                     config={{
                         youtube: {
                             playerVars: { showinfo: 1 }
                         }
                     }}
                />
            </Box>
        </AspectRatio>
    );
}
