import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  direction: "rtl",
  colors: {
    background: "#edf2f7",
    
    // الألوان الرئيسية
    primary: "#173f5f",
    secondary: "#ffffff",
    
    // ألوان متناسقة مع الثيم
    blue: {
      50: "#E6F3FF",
      100: "#B3DAFF",
      200: "#80C2FF",
      300: "#4DA9FF",
      400: "#1A91FF",
      500: "#173f5f", // اللون الأساسي
      600: "#133654",
      700: "#0f2d49",
      800: "#0b243e",
      900: "#071b33",
    },
    
    gray: {
      50: "#ffffff",
      100: "#f7fafc",
      200: "#edf2f7",
      300: "#e2e8f0",
      400: "#cbd5e0",
      500: "#a0aec0",
      600: "#718096",
      700: "#4a5568",
      800: "#2d3748",
      900: "#1a202c",
    },
    
    // ألوان إضافية متناسقة
    accent: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#173f5f",
      600: "#133654",
      700: "#0f2d49",
      800: "#0b243e",
      900: "#071b33",
    },
  },
  fonts: {
    heading: '"Tajawal", Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    body: '"Tajawal", Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
  styles: {
    global: {
      ':root': {
        '--primary-color': '#173f5f',
        '--secondary-color': '#ffffff',
        '--accent-color': '#173f5f',
        '--background-color': '#edf2f7',
        '--text-primary': '#173f5f',
        '--text-secondary': '#4a5568',
      },
      body: {
        bg: 'background',
        color: '#173f5f',
      },
    },
  },
});

export default theme;




