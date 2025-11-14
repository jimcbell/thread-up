import { useCallback, useState } from 'react';

const FileDropzone = ({ onFilesSelected, maxFiles = 10, maxFileSize = 10 * 1024 * 1024 }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFiles = (files) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const errors = [];
    const validFiles = [];

    Array.from(files).forEach((file) => {
      if (!validTypes.includes(file.type)) {
        errors.push(`${file.name} is not a valid image type. Please use JPG, PNG, or WebP.`);
      } else if (file.size > maxFileSize) {
        errors.push(`${file.name} is too large. Please use images under 10MB.`);
      } else if (validFiles.length < maxFiles) {
        validFiles.push(file);
      } else {
        errors.push(`Maximum ${maxFiles} files allowed.`);
      }
    });

    return { validFiles, errors };
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      const { validFiles, errors } = validateFiles(files);

      onFilesSelected(validFiles, errors);
    },
    [onFilesSelected, maxFiles, maxFileSize]
  );

  const handleFileInput = (e) => {
    const files = e.target.files;
    const { validFiles, errors } = validateFiles(files);
    onFilesSelected(validFiles, errors);
  };

  return (
    <div
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
        isDragging
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-300 bg-white hover:border-primary-400'
      }`}
    >
      <div className="flex flex-col items-center">
        {/* Stylized Wardrobe/Hanger Icon */}
        <svg
          className={`w-24 h-24 mb-6 transition-transform duration-300 ${
            isDragging ? 'scale-110 text-blue-500' : 'text-blue-400'
          }`}
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Hanger hook */}
          <path d="M100 20 Q85 20 85 35 Q85 50 100 50 Q115 50 115 35 Q115 20 100 20" />

          {/* Hanger rod */}
          <line x1="50" y1="55" x2="150" y2="55" strokeWidth="3" />

          {/* First clothing item (left) */}
          <path
            d="M70 55 L60 80 Q55 100 70 110 L90 110 Q105 100 100 80 Z"
            fill="currentColor"
            fillOpacity="0.2"
          />
          <path d="M70 55 L60 80 Q55 100 70 110 L90 110 Q105 100 100 80 Z" />

          {/* Second clothing item (center) */}
          <path
            d="M100 55 L80 85 Q75 110 100 125 L120 125 Q145 110 140 85 Z"
            fill="currentColor"
            fillOpacity="0.3"
          />
          <path d="M100 55 L80 85 Q75 110 100 125 L120 125 Q145 110 140 85 Z" />

          {/* Third clothing item (right) */}
          <path
            d="M130 55 L120 80 Q115 100 130 110 L150 110 Q165 100 160 80 Z"
            fill="currentColor"
            fillOpacity="0.2"
          />
          <path d="M130 55 L120 80 Q115 100 130 110 L150 110 Q165 100 160 80 Z" />

          {/* Plus sign for adding */}
          <circle cx="100" cy="160" r="25" fill="currentColor" fillOpacity="0.1" />
          <line x1="100" y1="145" x2="100" y2="175" strokeWidth="3" />
          <line x1="85" y1="160" x2="115" y2="160" strokeWidth="3" />
        </svg>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">Drop your clothing photos here</h3>
        <p className="text-sm text-gray-600 mb-4">or click to browse your files</p>

        <label className="inline-block cursor-pointer mb-8">
          <div className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105">
            Select Files
          </div>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>

        {/* Upload Requirements Block - Horizontal */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 w-full">
          <h4 className="text-sm font-semibold text-gray-900 mb-6">Upload Requirements</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-2">
              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-700">File Types</p>
                <p className="text-xs text-gray-600">JPG, PNG, WebP</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-700">File Size</p>
                <p className="text-xs text-gray-600">Maximum 10 MB per file</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <svg className="w-6 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-700">Quantity</p>
                <p className="text-xs text-gray-600">Up to {maxFiles} files per upload</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDropzone;
