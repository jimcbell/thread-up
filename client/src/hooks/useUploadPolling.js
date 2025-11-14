import { useState, useEffect, useRef } from 'react';
import { uploadAPI } from '../services/api';

const useUploadPolling = (uploadId, onComplete) => {
  const [status, setStatus] = useState('processing');
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!uploadId) return;

    const pollStatus = async () => {
      try {
        const data = await uploadAPI.getUploadStatus(uploadId);

        setStatus(data.status);
        setProcessedCount(data.processed_count || 0);
        setTotalCount(data.total_count || 0);

        if (data.status === 'ready_for_review') {
          clearInterval(intervalRef.current);
          clearTimeout(timeoutRef.current);
          if (onComplete) {
            onComplete();
          }
        } else if (data.status === 'error') {
          clearInterval(intervalRef.current);
          clearTimeout(timeoutRef.current);
          setError('Processing failed. Please try again.');
        }
      } catch (err) {
        console.error('Polling error:', err);
        setError('Failed to check status. Please refresh the page.');
      }
    };

    // Poll every 3 seconds
    intervalRef.current = setInterval(pollStatus, 10000);

    // Timeout after 5 minutes
    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current);
      setError('Processing is taking longer than expected. Please check back later.');
    }, 300000);

    // Initial poll
    pollStatus();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [uploadId, onComplete]);

  return { status, processedCount, totalCount, error };
};

export default useUploadPolling;
