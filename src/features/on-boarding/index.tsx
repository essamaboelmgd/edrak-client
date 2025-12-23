import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teacherRegistrationSchema, type TeacherRegistrationData } from "./schema";
import { Button } from "@/components/ui/button";
import { authApi } from "@/api/auth";
import { useNavigate } from "react-router-dom";

import { Step1BasicInfo } from "./components/Step1BasicInfo";
import { Step2Professional } from "./components/Step2Professional";
import { Step3Credentials } from "./components/Step3Credentials";
import { Step4SiteConfig } from "./components/Step4SiteConfig";

export default function TeacherRegistrationWizard() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const methods = useForm<TeacherRegistrationData>({
    resolver: zodResolver(teacherRegistrationSchema),
    mode: "onChange",
    defaultValues: {
        themeColor: "blue",
        templateId: "default",
        yearsOfExperience: 0
    }
  });

  const onSubmit = async (data: TeacherRegistrationData) => {
    setIsSubmitting(true);
    try {
        await authApi.registerTeacher(data);
        alert("Registration Successful! Redirecting to login...");
        navigate("/login");
    } catch (error: any) {
        console.error(error);
        alert("Registration Failed: " + (error.response?.data?.message || error.message));
    } finally {
        setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) isValid = await methods.trigger(["firstName", "middleName", "lastName", "gender", "governorate"]);
    if (step === 2) isValid = await methods.trigger(["email", "phone", "specialization", "yearsOfExperience", "bio"]);
    if (step === 3) isValid = await methods.trigger(["password", "confirmPassword"]);
    
    if (isValid) setStep(s => Math.min(s + 1, 4));
  };
  
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border my-12">
      <div className="mb-8">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
                className="h-full bg-blue-600 transition-all duration-300" 
                style={{ width: `${(step / 4) * 100}%` }}
            />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span className={step >= 1 ? "text-blue-600 font-medium" : ""}>Personal</span>
            <span className={step >= 2 ? "text-blue-600 font-medium" : ""}>Professional</span>
            <span className={step >= 3 ? "text-blue-600 font-medium" : ""}>Security</span>
            <span className={step >= 4 ? "text-blue-600 font-medium" : ""}>Academy</span>
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && <Step1BasicInfo />}
            {step === 2 && <Step2Professional />}
            {step === 3 && <Step3Credentials />}
            {step === 4 && <Step4SiteConfig />}

            <div className="flex justify-between pt-4 border-t">
                <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1}>
                    Back
                </Button>
                {step < 4 ? (
                    <Button type="button" onClick={nextStep}>Next Step</Button>
                ) : (
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Academy"}
                    </Button>
                )}
            </div>
        </form>
      </FormProvider>
    </div>
  );
}
