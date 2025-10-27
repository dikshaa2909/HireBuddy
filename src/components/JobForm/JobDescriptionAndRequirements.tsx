import React from "react";
import { useTheme } from "../../context/ThemeContext"; // Ensure correct import path

interface JobDescriptionAndRequirementsProps {
    formData: {
        description: string;
        keySkills: string[];
        requirements: string[];
    };
    handleChange: (newData: { [key: string]: any }) => void;
    errors: {
        description: boolean;
    };
}

const JobDescriptionAndRequirements: React.FC<JobDescriptionAndRequirementsProps> = ({
                                                                                         formData,
                                                                                         handleChange,
                                                                                         errors,
                                                                                     }) => {
    useTheme(); // Use the theme from ThemeContext

    const handleArrayChange = (e: React.KeyboardEvent<HTMLInputElement>, field: string) => {
        if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
            handleChange({
                [field]: [...formData[field], (e.target as HTMLInputElement).value.trim()],
            });
            (e.target as HTMLInputElement).value = "";
        }
    };

    const handleRemoveChip = (item: string, field: string) => {
        handleChange({
            [field]: formData[field].filter((chip) => chip !== item),
        });
    };

    return (
        <div className="space-y-6">
            {/* Title with theme-based color */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Job Description & Requirements</h1>

            {/* Job Description */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Job Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={(e) => handleChange({ description: e.target.value })}
                    placeholder="Enter job description..."
                    className={`mt-1 block w-full p-3 border ${
                        errors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
                    rows={4}
                />
                {errors.description && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">Job Description is required</p>
                )}
            </div>

            {/* Key Skills */}
            <div>
                <label htmlFor="keySkills" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Key Skills (Press Enter to add)
                </label>
                <input
                    type="text"
                    id="keySkills"
                    onKeyDown={(e) => handleArrayChange(e, "keySkills")}
                    placeholder="Enter key skills..."
                    className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                    {formData.keySkills.map((skill, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300"
                        >
                            {skill}
                            <button
                                type="button"
                                onClick={() => handleRemoveChip(skill, "keySkills")}
                                className="ml-2 p-1 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Requirements */}
            <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Requirements (Press Enter to add)
                </label>
                <input
                    type="text"
                    id="requirements"
                    onKeyDown={(e) => handleArrayChange(e, "requirements")}
                    placeholder="Enter requirements..."
                    className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                    {formData.requirements.map((req, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300"
                        >
                            {req}
                            <button
                                type="button"
                                onClick={() => handleRemoveChip(req, "requirements")}
                                className="ml-2 p-1 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default JobDescriptionAndRequirements;