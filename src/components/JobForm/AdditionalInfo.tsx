import React, { useState } from "react";
import { Checkbox, FormControlLabel } from "@mui/material";
import { useTheme } from "../../context/ThemeContext"; // Ensure correct import path

interface AdditionalInfoProps {
    formData: {
        additionalInfo: {
            education: string;
            experience: string;
        };
        benefits: string[];
        customQuestions: { question: string; required: boolean }[]; // New field
    };
    handleChange: (newData: { [key: string]: any }) => void;
}

const AdditionalInfo: React.FC<AdditionalInfoProps> = ({ formData, handleChange }) => {
    useTheme(); // Use the theme from ThemeContext

    const [newQuestion, setNewQuestion] = useState("");
    const [isRequired, setIsRequired] = useState(false);

    const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange({
            benefits: e.target.value.split(",").map((b) => b.trim()),
        });
    };

    const handleAddQuestion = () => {
        if (newQuestion.trim()) {
            handleChange({
                customQuestions: [
                    ...(formData.customQuestions || []), // Safeguard for undefined
                    { question: newQuestion.trim(), required: isRequired },
                ],
            });
            setNewQuestion(""); // Reset input
            setIsRequired(false); // Reset checkbox
        }
    };

    return (
        <div className="space-y-6">
            {/* Title with theme-based color */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Additional Information</h1>

            {/* Education Level */}
            <div>
                <label htmlFor="education" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Education Level
                </label>
                <select
                    id="education"
                    name="education"
                    value={formData.additionalInfo.education}
                    onChange={(e) =>
                        handleChange({
                            additionalInfo: { ...formData.additionalInfo, education: e.target.value },
                        })
                    }
                    className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                    <option value="High School">High School</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelor's (Preferred)">Bachelor's (Preferred)</option>
                    <option value="Master's">Master's</option>
                    <option value="PhD">PhD</option>
                </select>
            </div>

            {/* Experience Requirement */}
            <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Experience Requirement
                </label>
                <select
                    id="experience"
                    name="experience"
                    value={formData.additionalInfo.experience}
                    onChange={(e) =>
                        handleChange({
                            additionalInfo: { ...formData.additionalInfo, experience: e.target.value },
                        })
                    }
                    className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                    <option value="Fresher">Fresher</option>
                    <option value="1 year (Preferred)">1 year (Preferred)</option>
                    <option value="2+ years">2+ years</option>
                    <option value="5+ years">5+ years</option>
                </select>
            </div>

            {/* Benefits */}
            <div>
                <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Benefits (Comma Separated)
                </label>
                <input
                    type="text"
                    id="benefits"
                    name="benefits"
                    value={formData.benefits.join(", ")}
                    onChange={handleArrayChange}
                    placeholder="Enter benefits..."
                    className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
            </div>

            {/* Custom Questions */}
            <div>
                <label htmlFor="customQuestions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Custom Questions
                </label>
                <div className="space-y-4">
                    {(formData.customQuestions || []).map((q, index) => ( // Safeguard for undefined
                        <div key={index} className="flex items-center space-x-2">
                            <span className="text-gray-900 dark:text-white">{q.question}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                ({q.required ? "Required" : "Optional"})
                            </span>
                        </div>
                    ))}
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            placeholder="Enter a custom question..."
                            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isRequired}
                                    onChange={(e) => setIsRequired(e.target.checked)}
                                    className="text-indigo-600 dark:text-indigo-400"
                                />
                            }
                            label="Required"
                            className="text-gray-700 dark:text-gray-300"
                        />
                        <button
                            type="button"
                            onClick={handleAddQuestion}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdditionalInfo;