import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ErrorMessage from '../common/ErrorMessage';

const GoogleSignInButton = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);

    const result = await login(credentialResponse.credential);

    if (result.success) {
      navigate('/upload');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleError = () => {
    setError('Unable to sign in with Google. Please try again.');
  };

  return (
    <div>
      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          theme="filled_blue"
          size="large"
          text="signin_with"
          shape="rectangular"
        />
      </div>

      {loading && (
        <p className="mt-3 text-sm text-gray-600 text-center">Signing you in...</p>
      )}
    </div>
  );
};

export default GoogleSignInButton;
