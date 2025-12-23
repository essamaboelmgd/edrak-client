import { client } from './client';
import { TeacherRegistrationData } from '@/features/on-boarding/schema';

const mapColorToHex = (colorName: string) => {
  const colors: Record<string, string> = {
    blue: '#2563eb',
    purple: '#9333ea',
    green: '#16a34a',
    orange: '#ea580c',
    slate: '#475569'
  };
  return colors[colorName] || '#2563eb';
};

export const authApi = {
  registerTeacher: async (data: TeacherRegistrationData) => {
    // Map frontend data to backend payload
    const payload = {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      mobileNumber: data.phone,
      whatsappNumber: data.phone, // Default to mobile
      gender: data.gender,
      governorate: data.governorate,
      specialization: data.specialization,
      yearsOfExperience: data.yearsOfExperience,
      bio: data.bio,
      subdomain: data.subdomain,
      platformSettings: {
        platformName: data.siteName,
        theme: data.templateId, 
        primaryColor: mapColorToHex(data.themeColor),
        secondaryColor: data.secondaryColor ? mapColorToHex(data.secondaryColor) : '#ffffff'
      }
    };

    const response = await client.post('/auth/signup/teacher', payload);
    return response.data;
  }
};
