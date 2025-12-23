
export interface ThemeProps {
  primaryColor: string;
  secondaryColor: string;
  platformName: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  component: React.ComponentType<ThemeProps>;
  thumbnail: string; // URL or component for thumbnail
}
