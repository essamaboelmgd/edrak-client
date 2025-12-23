import { client } from './client';
import { TeacherRegistrationData } from '@/features/on-boarding/schema';

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
      platformSettings: {
        platformName: data.siteName,
        theme: data.templateId, // Using templateId as theme for now
        primaryColor: data.themeColor === 'blue' ? '#2563eb' : 
                      data.themeColor === 'purple' ? '#9333ea' : 
                      data.themeColor === 'green' ? '#16a34a' : 
                      data.themeColor === 'orange' ? '#ea580c' : '#475569',
        secondaryColor: '#ffffff' // Default
      }
    };

    const response = await client.post('/auth/signup/teacher', payload);
    return response.data;
  }
};
