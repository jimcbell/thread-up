import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import FileDropzone from '../components/upload/FileDropzone';
import ImagePreviewCard from '../components/upload/ImagePreviewCard';
import ProcessingStatus from '../components/upload/ProcessingStatus';
import ErrorMessage from '../components/common/ErrorMessage';
import ToastNotification from '../components/common/ToastNotification';
import { uploadAPI } from '../services/api';
import useUploadPolling from '../hooks/useUploadPolling';

const UploadPage = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadId, setUploadId] = useState(null);
  const [toast, setToast] = useState(null);

  // Check for pending upload in localStorage
  const pendingUploadId = localStorage.getItem('active_upload_id');

  const {
    status,
    processedCount,
    totalCount,
    error: pollingError,
  } = useUploadPolling(uploadId, () => {
    localStorage.removeItem('active_upload_id');
    navigate('/review');
  });

  const handleFilesSelected = (files, fileErrors) => {
    if (fileErrors.length > 0) {
      setErrors(fileErrors);
    } else {
      setErrors([]);
    }

    setSelectedFiles((prev) => {
      const combined = [...prev, ...files];
      return combined.slice(0, 10); // Max 10 files
    });
  };

  const handleRemoveFile = (fileToRemove) => {
    setSelectedFiles((prev) => prev.filter((file) => file !== fileToRemove));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setErrors([]);

    try {
      // Step 1: Start upload and get signed URLs
      const { upload_id, signed_urls } = await uploadAPI.startUpload(selectedFiles.length);
      setUploadId(upload_id);
      localStorage.setItem('active_upload_id', upload_id);

      // Step 2: Upload each file to S3
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const { image_id, url, s3_key } = signed_urls[index];
        console.log(image_id, url, s3_key);
        await uploadAPI.uploadToS3(url, file, (progress) => {
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: { progress, status: 'uploading' },
          }));
        });

        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: { progress: 100, status: 'complete' },
        }));
      });

      await Promise.all(uploadPromises);

      // Step 3: Notify backend upload is complete
      await uploadAPI.completeUpload(upload_id);

      setToast({ message: 'Upload complete! Processing...', type: 'success' });

      // Polling will start automatically via useUploadPolling hook
    } catch (error) {
      console.error('Upload failed:', error);
      setErrors(['Upload failed. Please try again.']);
      setUploading(false);
      localStorage.removeItem('active_upload_id');
    }
  };

  const getFileStatus = (file) => {
    const fileProgress = uploadProgress[file.name];
    if (!fileProgress) return 'pending';
    return fileProgress.status;
  };

  const getFileProgress = (file) => {
    return uploadProgress[file.name]?.progress || 0;
  };

  // If currently processing, show processing status
  if (uploadId && status === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ProcessingStatus processedCount={processedCount} totalCount={totalCount} />
          {pollingError && <ErrorMessage message={pollingError} />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Clothing Items</h1>
          <p className="text-gray-600">
            Add photos of your clothing items to your virtual wardrobe.
          </p>
        </div>

        {/* Pending Upload Banner */}
        {pendingUploadId && !uploadId && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-blue-800">
                You have items being processed from a previous upload.
              </p>
            </div>
            <button onClick={() => setUploadId(pendingUploadId)} className="btn-primary">
              Check Status
            </button>
          </div>
        )}

        {errors.length > 0 && (
          <div className="mb-6">
            {errors.map((error, index) => (
              <ErrorMessage key={index} message={error} />
            ))}
          </div>
        )}

        <FileDropzone onFilesSelected={handleFilesSelected} />

        {selectedFiles.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedFiles.length} image{selectedFiles.length !== 1 ? 's' : ''} selected
              </h2>
              <button onClick={handleUpload} disabled={uploading} className="btn-primary">
                {uploading ? 'Uploading...' : 'Upload Items'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedFiles.map((file, index) => (
                <ImagePreviewCard
                  key={`${file.name}-${index}`}
                  file={file}
                  progress={getFileProgress(file)}
                  status={getFileStatus(file)}
                  onRemove={handleRemoveFile}
                />
              ))}
            </div>
          </div>
        )}

        {selectedFiles.length === 0 && !pendingUploadId && (
          <div className="mt-8 text-center text-gray-500">
            <p>No files selected yet. Drop some images above or click to browse.</p>
          </div>
        )}
      </div>

      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default UploadPage;
