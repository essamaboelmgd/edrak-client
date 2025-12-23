import { useFormContext } from "react-hook-form";
import { TeacherRegistrationData } from "../schema";

export const Step1BasicInfo = () => {
  const { register, formState: { errors } } = useFormContext<TeacherRegistrationData>();

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">First Name</label>
          <input 
            {...register("firstName")}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="Ahmed"
          />
          {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Middle Name</label>
          <input 
            {...register("middleName")}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="Mohamed"
          />
          {errors.middleName && <p className="text-sm text-red-500">{errors.middleName.message}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Last Name</label>
          <input 
            {...register("lastName")}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="Ali"
          />
          {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Gender</label>
          <select 
            {...register("gender")}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
        </div>

        <div className="space-y-2 col-span-2">
          <label className="text-sm font-medium">Governorate</label>
          <select 
            {...register("governorate")}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="">Select Governorate</option>
            <option value="Cairo">Cairo (القاهرة)</option>
            <option value="Giza">Giza (الجيزة)</option>
            <option value="Alexandria">Alexandria (الإسكندرية)</option>
            <option value="Dakahlia">Dakahlia (الدقهلية)</option>
            <option value="Sharqia">Sharqia (الشرقية)</option>
            <option value="Monufia">Monufia (المنوفية)</option>
            <option value="Qalyubia">Qalyubia (القليوبية)</option>
            <option value="Beheira">Beheira (البحيرة)</option>
            <option value="Gharbia">Gharbia (الغربية)</option>
            <option value="Damietta">Damietta (دمياط)</option>
            <option value="Kafr El Sheikh">Kafr El Sheikh (كفر الشيخ)</option>
          </select>
          {errors.governorate && <p className="text-sm text-red-500">{errors.governorate.message}</p>}
        </div>


      </div>
    </div>
  );
};
