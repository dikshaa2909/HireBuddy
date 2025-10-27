import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext"; // Ensure correct import path

interface CompensationProps {
    formData: {
        pay: {
            min: string;
            max: string;
            currency: string;
        };
    };
    handleChange: (newData: { [key: string]: any }) => void;
}

const Compensation: React.FC<CompensationProps> = ({ formData, handleChange }) => {
    useTheme(); // Use the theme from ThemeContext
    const [errors, setErrors] = useState({
        min: "",
        max: "",
    });

    const validateSalary = (min: string, max: string) => {
        const newErrors = { min: "", max: "" };

        if (min && max && parseFloat(min) > parseFloat(max)) {
            newErrors.min = "Min salary cannot be greater than max salary.";
        }
        if (min && max && parseFloat(max) < parseFloat(min)) {
            newErrors.max = "Max salary cannot be less than min salary.";
        }

        setErrors(newErrors);
        return !newErrors.min && !newErrors.max; // Return true if no errors
    };

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const min = e.target.value;
        handleChange({
            pay: { ...formData.pay, min },
        });
        validateSalary(min, formData.pay.max);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const max = e.target.value;
        handleChange({
            pay: { ...formData.pay, max },
        });
        validateSalary(formData.pay.min, max);
    };

    return (
        <div className="space-y-6">
            {/* Title with theme-based color */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Compensation & Benefits</h1>

            {/* Min and Max Salary */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="min" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Min Salary
                    </label>
                    <input
                        type="number"
                        id="min"
                        name="min"
                        value={formData.pay.min}
                        onChange={handleMinChange}
                        placeholder="Enter min salary..."
                        className={`mt-1 block w-full p-3 border ${
                            errors.min ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                        } rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
                    />
                    {errors.min && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.min}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="max" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Max Salary
                    </label>
                    <input
                        type="number"
                        id="max"
                        name="max"
                        value={formData.pay.max}
                        onChange={handleMaxChange}
                        placeholder="Enter max salary..."
                        className={`mt-1 block w-full p-3 border ${
                            errors.max ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                        } rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
                    />
                    {errors.max && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.max}</p>
                    )}
                </div>
            </div>

            {/* Currency */}
            <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Currency
                </label>
                <select
                    id="currency"
                    name="currency"
                    value={formData.pay.currency}
                    onChange={(e) =>
                        handleChange({
                            pay: { ...formData.pay, currency: e.target.value },
                        })
                    }
                    className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                </select>
            </div>
        </div>
    );
};

export default Compensation;