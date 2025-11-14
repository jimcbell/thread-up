import LoadingSpinner from '../common/LoadingSpinner';

const ProcessingStatus = ({ processedCount, totalCount }) => {
  return (
    <div className="max-w-md mx-auto text-center">
      <div className="mb-6">
        <LoadingSpinner size="lg" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Processing Your Items...
      </h2>

      <p className="text-gray-600 mb-6">
        Our AI is analyzing your clothing items. This usually takes 30-60 seconds.
      </p>

      {totalCount > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{processedCount} of {totalCount} analyzed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(processedCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500 mt-6">
        Hang tight! We're identifying colors, patterns, and categories...
      </p>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 Tip: You can safely close this page and come back later. We'll save your progress!
        </p>
      </div>
    </div>
  );
};

export default ProcessingStatus;
