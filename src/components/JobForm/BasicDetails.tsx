import React from "react";
import { useTheme } from "../../context/ThemeContext"; // Ensure correct import path

interface BasicDetailsProps {
    formData: {
        title: string;
        company: string;
        location: string;
        jobType: string; // Changed from string[] to string
        shift: string;
    };
    handleChange: (newData: { [key: string]: any }) => void;
    errors: {
        title: boolean;
        company: boolean;
        location: boolean;
        jobType: boolean;
        shift: boolean;
    };
}

const BasicDetails: React.FC<BasicDetailsProps> = ({ formData, handleChange, errors }) => {
    useTheme(); // Use the theme from ThemeContext

    return (
        <div className="space-y-6">
            {/* Title with theme-based color */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Basic Details</h1>

            {/* Job Title */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Job Title
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={(e) => handleChange({ title: e.target.value })}
                    placeholder="Enter job title..."
                    className={`mt-1 block w-full p-3 border ${
                        errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
                />
                {errors.title && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">Job Title is required</p>
                )}
            </div>

            {/* Company */}
            <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company
                </label>
                <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={(e) => handleChange({ company: e.target.value })}
                    placeholder="Enter company name..."
                    className={`mt-1 block w-full p-3 border ${
                        errors.company ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
                />
                {errors.company && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">Company is required</p>
                )}
            </div>

            {/* Location */}
            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location
                </label>
                <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={(e) => handleChange({ location: e.target.value })}
                    placeholder="Enter location..."
                    className={`mt-1 block w-full p-3 border ${
                        errors.location ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
                />
                {errors.location && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">Location is required</p>
                )}
            </div>

            {/* Job Type */}
            <div>
                <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Job Type
                </label>
                <select
                    id="jobType"
                    name="jobType"
                    value={formData.jobType}
                    onChange={(e) => handleChange({ jobType: e.target.value })}
                    className={`mt-1 block w-full p-3 border ${
                        errors.jobType ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
                >
                    <option value="">Select Job Type</option> {/* Add an empty option */}
                    {["Full-time", "Part-time", "Contract", "Internship", "Temporary"].map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
                {errors.jobType && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">Job Type is required</p>
                )}
            </div>

            {/* Shift */}
            <div>
                <label htmlFor="shift" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Shift Type
                </label>
                <select
                    id="shift"
                    name="shift"
                    value={formData.shift}
                    onChange={(e) => handleChange({ shift: e.target.value })}
                    className={`mt-1 block w-full p-3 border ${
                        errors.shift ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
                >
                    <option value="">Select Shift Type</option> {/* Add an empty option */}
                    {["Day shift", "Night shift", "Rotational shift"].map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
                {errors.shift && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">Shift Type is required</p>
                )}
            </div>
        </div>
    );
};

export default BasicDetails;