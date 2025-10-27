import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Eye, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

type DocType = 'offer' | 'termination' | 'other';

interface FormData {
  name: string;
  position: string;
  startDate: string;
  salary: string;
}

function DocGeneration() {
  const [docType, setDocType] = useState<DocType>('offer');
  const [logo, setLogo] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    position: '',
    startDate: '',
    salary: ''
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateDocument = () => {
    const doc = new jsPDF();

    // Add logo if exists
    if (logo) {
      doc.addImage(logo, 'JPEG', 170, 10, 30, 30);
    }

    // Add content based on document type
    doc.setFontSize(20);
    doc.text(docType === 'offer' ? 'Offer Letter' : 'Termination Letter', 20, 20);

    // Add recipient details
    doc.setFontSize(12);
    doc.text(`Dear ${formData.name},`, 20, 40);

    // Add body content for the offer letter
    if (docType === 'offer') {
      const bodyText = `We are pleased to extend an offer for the position of ${formData.position} at our company. 
      Your start date will be ${formData.startDate}, and your annual salary will be ${formData.salary}. 

      We look forward to having you as part of our team!`;

      // Adjust text placement and split long text into multiple lines if needed
      doc.text(bodyText, 20, 50, { maxWidth: 180 });

      // Add signature section
      doc.text('Sincerely,', 20, 100);
      doc.text('Your Company Name', 20, 110);
    }

    // Add content for termination letter or other document type
    if (docType === 'termination') {
      const bodyText = `We regret to inform you that your employment with our company will be terminated. 
      Please find the necessary details attached.`;

      doc.text(bodyText, 20, 50, { maxWidth: 180 });
    }

    return doc;
  };

  const handlePreview = () => {
    const doc = generateDocument();
    window.open(doc.output('bloburl'), '_blank');
  };

  const handleDownload = () => {
    const doc = generateDocument();
    doc.save(`${docType}_letter_${formData.name}.pdf`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Document Generation</h1>

      {/* Logo Upload */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Company Logo</h2>
        <div {...getRootProps()} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer">
          <input {...getInputProps()} />
          {logo ? (
            <img src={logo} alt="Company Logo" className="mx-auto h-20 object-contain" />
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Upload company logo</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Supports PNG, JPG</p>
            </>
          )}
        </div>
      </div>

      {/* Document Type Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Document Type</h2>
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value as DocType)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="offer">Offer Letter</option>
          <option value="termination">Termination Letter</option>
          <option value="other">Other Company Document</option>
        </select>
      </div>

      {/* Form Fields */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Document Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Position
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Salary
            </label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-4">
        <button
          onClick={handlePreview}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Eye size={20} />
          <span>Preview</span>
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Download size={20} />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
}

export default DocGeneration;
