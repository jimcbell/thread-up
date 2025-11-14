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
        <svg
          className={`w-16 h-16 mb-4 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Drop your clothing photos here
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          or click to browse your files
        </p>

        <label className="btn-primary cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileInput}
            className="hidden"
          />
          Select Files
        </label>

        <p className="mt-4 text-xs text-gray-500">
          Supports JPG, PNG, WebP (up to {maxFiles} files, max 10MB each)
        </p>
      </div>
    </div>
  );
};

export default FileDropzone;
