import { z } from "zod";

export const teacherRegistrationSchema = z.object({
  // Step 1: Personal Info
  firstName: z.string().min(2, "First name is required"),
  middleName: z.string().min(2, "Middle name is required"),
  lastName: z.string().min(2, "Last name is required"),
  gender: z.enum(["male", "female"], { required_error: "Gender is required" }),
  governorate: z.string().min(2, "Governorate is required"),

  // Step 2: Contact & Professional
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  specialization: z.string().min(2, "Specialization is required"),
  yearsOfExperience: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(0, "Must be positive")),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),

  // Step 3: Credentials
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string(),

  // Step 4: Site Configuration
  siteName: z.string().min(3, "Academy name is required"),
  subdomain: z.string().min(3, "Subdomain is required")
    .regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"),
  themeColor: z.enum(["blue", "purple", "green", "orange", "slate"]),
  templateId: z.string().min(1, "Please select a template"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type TeacherRegistrationData = z.infer<typeof teacherRegistrationSchema>;
