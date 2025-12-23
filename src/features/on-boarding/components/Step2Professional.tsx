import { useFormContext } from "react-hook-form";
import { TeacherRegistrationData } from "../schema";

export const Step2Professional = () => {
  const { register, formState: { errors } } = useFormContext<TeacherRegistrationData>();

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <label className="text-sm font-medium">Email Address</label>
          <input 
            type="email"
            {...register("email")}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="doctor@university.edu"
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Phone Number</label>
          <input 
            type="tel"
            {...register("phone")}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="010xxxxxxx"
          />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Years of Experience</label>
          <input 
            type="number"
            {...register("yearsOfExperience")}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="5"
          />
          {errors.yearsOfExperience && <p className="text-sm text-red-500">{errors.yearsOfExperience.message}</p>}
        </div>

        <div className="space-y-2 col-span-2">
          <label className="text-sm font-medium">Specialization</label>
          <select 
            {...register("specialization")}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
             <option value="">Select Specialization</option>
             <option value="Mathematics">Mathematics (الرياضيات)</option>
             <option value="Physics">Physics (الفيزياء)</option>
             <option value="Chemistry">Chemistry (الكيمياء)</option>
             <option value="Biology">Biology (الأحياء)</option>
             <option value="English">English (اللغة الإنجليزية)</option>
             <option value="Arabic">Arabic (اللغة العربية)</option>
             <option value="History">History (التاريخ)</option>
             <option value="Geography">Geography (الجغرافيا)</option>
             <option value="Other">Other (أخرى)</option>
          </select>
          {errors.specialization && <p className="text-sm text-red-500">{errors.specialization.message}</p>}
        </div>

        <div className="space-y-2 col-span-2">
          <label className="text-sm font-medium">Short Bio</label>
          <textarea 
            {...register("bio")}
            className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="Tell us about yourself..."
          />
          {errors.bio && <p className="text-sm text-red-500">{errors.bio.message}</p>}
        </div>
      </div>
    </div>
  );
};
