const ImagePreviewCard = ({ file, progress, onRemove, status = 'pending' }) => {
  const previewUrl = URL.createObjectURL(file);

  return (
    <div className="relative group">
      <div className="card overflow-hidden">
        <img
          src={previewUrl}
          alt={file.name}
          className="w-full h-48 object-cover"
        />

        {/* Progress Bar */}
        {status === 'uploading' && (
          <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-75 p-2">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-white text-center mt-1">{progress}%</p>
          </div>
        )}

        {/* Success Indicator */}
        {status === 'complete' && (
          <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
            <div className="bg-green-500 rounded-full p-2">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}

        {/* Remove Button */}
        {status === 'pending' && (
          <button
            onClick={() => onRemove(file)}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-gray-600 truncate">{file.name}</p>
      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
    </div>
  );
};

export default ImagePreviewCard;
