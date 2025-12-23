import { useFormContext } from "react-hook-form";
import { TeacherRegistrationData } from "../schema";

export const Step3Credentials = () => {
  const { register, formState: { errors } } = useFormContext<TeacherRegistrationData>();

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>
        <input 
          type="password"
          {...register("password")}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          placeholder="••••••••"
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Confirm Password</label>
        <input 
          type="password"
          {...register("confirmPassword")}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          placeholder="••••••••"
        />
        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
      </div>

      <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700">
        <p className="font-semibold">Security Requirement:</p>
        <ul className="list-disc list-inside mt-1">
            <li>Minimum 8 characters</li>
            <li>At least one uppercase letter</li>
            <li>At least one number</li>
        </ul>
      </div>
    </div>
  );
};
