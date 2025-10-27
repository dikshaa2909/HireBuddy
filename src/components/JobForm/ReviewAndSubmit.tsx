import React from "react";
import { useTheme } from "../../context/ThemeContext"; // Ensure correct import path

interface ReviewAndSubmitProps {
    formData: {
        title: string;
        company: string;
        location: string;
        pay: { min: string; max: string; currency: string };
        jobType: string[];
        shift: string;
        description: string;
        keySkills: string[];
        requirements: string[];
        additionalInfo: { education: string; experience: string };
        benefits: string[];
        customQuestions: { question: string; required: boolean }[]; // New field
    };
    handleSubmit: () => void;
}

const ReviewAndSubmit: React.FC<ReviewAndSubmitProps> = ({ formData, handleSubmit }) => {
    const { theme } = useTheme(); // Use the theme from ThemeContext

    return (
        <div className="space-y-6">
            {/* Title with theme-based color */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Review & Submit</h1>

            {/* Job Details */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Job Details</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                        <p className="text-gray-900 dark:text-white">{formData.title || "N/A"}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company</label>
                        <p className="text-gray-900 dark:text-white">{formData.company || "N/A"}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                        <p className="text-gray-900 dark:text-white">{formData.location || "N/A"}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Salary</label>
                        <p className="text-gray-900 dark:text-white">
                            {formData.pay?.min || "N/A"} - {formData.pay?.max || "N/A"} {formData.pay?.currency || ""}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Job Type</label>
                        <p className="text-gray-900 dark:text-white">{formData.jobType || "N/A"}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shift</label>
                        <p className="text-gray-900 dark:text-white">{formData.shift || "N/A"}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <p className="text-gray-900 dark:text-white">{formData.description || "N/A"}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Key Skills</label>
                        <p className="text-gray-900 dark:text-white">
                            {Array.isArray(formData.keySkills) ? formData.keySkills.join(", ") : "N/A"}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Requirements</label>
                        <p className="text-gray-900 dark:text-white">
                            {Array.isArray(formData.requirements) ? formData.requirements.join(", ") : "N/A"}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Education</label>
                        <p className="text-gray-900 dark:text-white">{formData.additionalInfo?.education || "N/A"}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Experience</label>
                        <p className="text-gray-900 dark:text-white">{formData.additionalInfo?.experience || "N/A"}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Benefits</label>
                        <p className="text-gray-900 dark:text-white">
                            {Array.isArray(formData.benefits) ? formData.benefits.join(", ") : "N/A"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Custom Questions */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Custom Questions</h2>

                <div className="space-y-4">
                    {formData.customQuestions?.map((q, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <span className="text-gray-900 dark:text-white">{q.question}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                ({q.required ? "Required" : "Optional"})
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="button"
                onClick={handleSubmit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
                Submit Job
            </button>
        </div>
    );
};

export default ReviewAndSubmit;