import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext"; // Ensure correct import path
import { useNavigate } from "react-router-dom"; // Import useNavigate
import BasicDetails from "../components/JobForm/BasicDetails";
import Compensation from "../components/JobForm/Compensation";
import JobDescriptionAndRequirements from "../components/JobForm/JobDescriptionAndRequirements";
import AdditionalInfo from "../components/JobForm/AdditionalInfo";
import ReviewAndSubmit from "../components/JobForm/ReviewAndSubmit";
import { auth } from "../firebase"; // Import Firebase auth
import { useJobContext } from "../context/JobContext"; // Import our job context

const steps = [
    "Basic Details",
    "Compensation & Benefits",
    "Job Description & Requirements",
    "Additional Info",
    "Review & Submit",
];

interface FormData {
    title: string;
    company: string;
    location: string;
    pay: { min: string; max: string; currency: string };
    jobType: string;
    shift: string;
    description: string;
    keySkills: string[];
    requirements: string[];
    additionalInfo: { education: string; experience: string };
    benefits: string[];
    customQuestions: { question: string; required: boolean }[];
    hrEmail: string; // Add HR's email field
}

const JobBuilderForm = () => {
    useTheme(); // Use the theme from ThemeContext
    const navigate = useNavigate(); // Initialize useNavigate
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<FormData>({
        title: "",
        company: "",
        location: "",
        pay: { min: "", max: "", currency: "INR" },
        jobType: "", // Updated to match schema (array of strings)
        shift: "", // Updated to match schema (default value)
        description: "",
        keySkills: [],
        requirements: [],
        additionalInfo: { education: "Bachelor's (Preferred)", experience: "1 year (Preferred)" },
        benefits: [],
        customQuestions: [],
        hrEmail: "", // Initialize HR's email field
    });

    const [errors, setErrors] = useState({
        title: false,
        company: false,
        location: false,
        jobType: false,
        shift: false,
        description: false,
    });

    // Get the authenticated user's email and set it in formData
    useEffect(() => {
        const user = auth.currentUser;
        if (user && user.email) {
            setFormData((prev) => ({ ...prev, hrEmail: user.email }));
        }
    }, []);

    const validateStep = () => {
        let newErrors = { title: false, company: false, location: false, jobType: false, shift: false, description: false };

        // Step-specific validation
        switch (activeStep) {
            case 0: // Basic Details
                newErrors = {
                    ...newErrors,
                    title: !formData.title,
                    company: !formData.company,
                    location: !formData.location,
                    jobType: formData.jobType.length === 0, // Validate jobType as an array
                    shift: !formData.shift,
                };
                break;
            case 1: // Compensation & Benefits
                // No validation needed for this step
                break;
            case 2: // Job Description & Requirements
                newErrors = {
                    ...newErrors,
                    description: !formData.description,
                };
                break;
            case 3: // Additional Info
                // No validation needed for this step
                break;
            case 4: // Review & Submit
                // No validation needed for this step
                break;
            default:
                break;
        }

        setErrors(newErrors);

        // Log validation errors only if there are errors
        const hasErrors = Object.values(newErrors).some((error) => error);
        if (hasErrors) {
            console.log("Validation Errors:", newErrors);
        }

        // Return true if no errors
        return !hasErrors;
    };

    const handleNext = () => {
        if (validateStep()) {
            setActiveStep((prev) => prev + 1);
        } else {
            console.log("Validation failed. Please fill all required fields.");
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleChange = (newData: Partial<FormData>) => {
        setFormData((prev) => ({ ...prev, ...newData }));
    };

    // Use the job context
    const { addJob } = useJobContext();

    const handleSubmit = async () => {
        try {
            // Format the job data to match our Job interface
            const jobData = {
                title: formData.title,
                company: formData.company,
                location: formData.location,
                type: formData.jobType,
                salary: `${formData.pay.currency} ${formData.pay.min} - ${formData.pay.max}`,
                description: formData.description,
                postedAt: new Date(),
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                hrEmail: formData.hrEmail,
                requirements: formData.requirements,
                keySkills: formData.keySkills,
                benefits: formData.benefits,
                additionalInfo: formData.additionalInfo,
                // Add missing fields that match the Job interface
                jobType: [formData.jobType], // Convert to array as expected
                shift: formData.shift,
                pay: {
                    min: parseInt(formData.pay.min),
                    max: parseInt(formData.pay.max),
                    currency: formData.pay.currency
                }
            };

            // Add the job using our context
            const jobId = await addJob(jobData);
            console.log("Job submitted successfully with ID:", jobId);
            alert("Job posted successfully!");

            // Redirect to the Posted Jobs page
            navigate("/posted-jobs");
        } catch (error) {
            console.error("Error submitting job:", error);
            alert("Failed to post job.");
        }
    };

    return (
        <div className="space-y-6">
            {/* Stepper */}
            <div className="w-full max-w-3xl mx-auto">
                <div className="flex justify-between items-center">
                    {steps.map((label, index) => (
                        <div key={label} className="flex items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    activeStep === index
                                        ? "bg-indigo-600 text-white"
                                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                }`}
                            >
                                {index + 1}
                            </div>
                            <span
                                className={`ml-2 text-sm font-medium ${
                                    activeStep === index
                                        ? "text-indigo-600 dark:text-indigo-400"
                                        : "text-gray-600 dark:text-gray-400"
                                }`}
                            >
                                {label}
                            </span>
                            {index < steps.length - 1 && (
                                <div className="w-16 h-0.5 bg-gray-200 dark:bg-gray-700 mx-2"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Content */}
            <div className="w-full max-w-3xl mx-auto">
                {activeStep === 0 && <BasicDetails formData={formData} handleChange={handleChange} errors={errors} />}
                {activeStep === 1 && <Compensation formData={formData} handleChange={handleChange} />}
                {activeStep === 2 && (
                    <JobDescriptionAndRequirements
                        formData={formData}
                        handleChange={handleChange}
                        errors={{ description: errors.description }}
                    />
                )}
                {activeStep === 3 && <AdditionalInfo formData={formData} handleChange={handleChange} />}
                {activeStep === 4 && <ReviewAndSubmit formData={formData} handleSubmit={handleSubmit} />}
            </div>

            {/* Navigation Buttons */}
            <div className="w-full max-w-3xl mx-auto flex justify-between">
                <button
                    type="button"
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Back
                </button>
                {activeStep < steps.length - 1 ? (
                    <button
                        type="button"
                        onClick={handleNext}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Next
                    </button>
                ) : null}
            </div>
        </div>
    );
};

export default JobBuilderForm;