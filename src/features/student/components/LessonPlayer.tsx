import { Box, Heading, Text, AspectRatio } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

const StudentLessonPlayer = () => {
    const { courseId } = useParams();

    return (
        <Box p={6}>
           <Heading mb={4}>مشاهدة الدرس</Heading>
           <AspectRatio maxW='1000px' ratio={16 / 9} mb={6}>
                <iframe
                    title='Lesson Video'
                    src='https://www.youtube.com/embed/dQw4w9WgXcQ'
                    allowFullScreen
                />
            </AspectRatio>
            <Text>محتوى الدرس للكورس {courseId}</Text>
        </Box>
    );
};

export default StudentLessonPlayer;
