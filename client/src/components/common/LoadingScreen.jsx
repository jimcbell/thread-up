import LoadingSpinner from './LoadingSpinner';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
};

export default LoadingScreen;
