import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Box } from '@chakra-ui/react';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Sidebar
      isOpen={isSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}
    >
      <Header onOpen={() => setIsSidebarOpen(true)} />
      <Box p={4}>
        <Outlet />
      </Box>
    </Sidebar>
  );
}
