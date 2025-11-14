import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import OccasionSelector from '../components/outfits/OccasionSelector';
import OutfitCard from '../components/outfits/OutfitCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ToastNotification from '../components/common/ToastNotification';
import { outfitsAPI } from '../services/api';

const OutfitsPage = () => {
  const navigate = useNavigate();
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [generatedOutfits, setGeneratedOutfits] = useState([]);
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' or 'saved'

  useEffect(() => {
    loadSavedOutfits();
  }, []);

  const loadSavedOutfits = async () => {
    try {
      const data = await outfitsAPI.getSavedOutfits();
      setSavedOutfits(data);
    } catch (err) {
      console.error('Failed to load saved outfits:', err);
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleGenerateOutfits = async () => {
    if (!selectedOccasion) return;

    setGenerating(true);
    setError(null);
    setGeneratedOutfits([]);

    try {
      const data = await outfitsAPI.generateOutfits(selectedOccasion);

      if (!data || data.length === 0) {
        setError(
          `We couldn't find enough matching items to generate ${selectedOccasion.replace('_', ' ')} outfits. Try uploading more variety!`
        );
      } else {
        setGeneratedOutfits(data);
        setToast({
          message: `Generated ${data.length} outfit${data.length !== 1 ? 's' : ''}!`,
          type: 'success',
        });
      }
    } catch (err) {
      console.error('Failed to generate outfits:', err);
      setError('Failed to generate outfits. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveOutfit = async (outfitId) => {
    try {
      await outfitsAPI.saveOutfit(outfitId);
      setToast({ message: 'Outfit saved!', type: 'success' });
      loadSavedOutfits(); // Refresh saved outfits
    } catch (err) {
      console.error('Failed to save outfit:', err);
      setToast({ message: 'Failed to save outfit', type: 'error' });
    }
  };

  const handleUnsaveOutfit = async (outfitId) => {
    try {
      await outfitsAPI.unsaveOutfit(outfitId);
      setToast({ message: 'Outfit removed from saved', type: 'info' });
      loadSavedOutfits(); // Refresh saved outfits

      // If on saved tab, remove from display
      if (activeTab === 'saved') {
        setSavedOutfits((prev) => prev.filter((outfit) => outfit.id !== outfitId));
      }
    } catch (err) {
      console.error('Failed to unsave outfit:', err);
      setToast({ message: 'Failed to remove outfit', type: 'error' });
    }
  };

  const isOutfitSaved = (outfitId) => {
    return savedOutfits.some((outfit) => outfit.id === outfitId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Outfit Generator</h1>
          <p className="text-gray-600">Get AI-powered outfit suggestions for any occasion</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('generate')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'generate'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Generate Outfits
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'saved'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Saved Outfits ({savedOutfits.length})
          </button>
        </div>

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select an Occasion</h2>
              <OccasionSelector
                selectedOccasion={selectedOccasion}
                onSelect={setSelectedOccasion}
              />
            </div>

            <div className="mb-8">
              <button
                onClick={handleGenerateOutfits}
                disabled={!selectedOccasion || generating}
                className="btn-primary text-lg px-8 py-3"
              >
                {generating ? (
                  <>
                    <LoadingSpinner size="sm" className="inline-block mr-2" />
                    Creating outfit combinations...
                  </>
                ) : (
                  'Generate Outfits'
                )}
              </button>
            </div>

            {error && (
              <div className="mb-8">
                <ErrorMessage message={error} />
                <div className="mt-4 text-center">
                  <button onClick={() => navigate('/upload')} className="btn-primary">
                    Upload More Items
                  </button>
                </div>
              </div>
            )}

            {generatedOutfits.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Outfit Suggestions</h2>
                  <button onClick={handleGenerateOutfits} className="btn-secondary">
                    Generate More
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {generatedOutfits.map((outfit) => (
                    <OutfitCard
                      key={outfit.id}
                      outfit={outfit}
                      onSave={handleSaveOutfit}
                      onUnsave={handleUnsaveOutfit}
                      isSaved={isOutfitSaved(outfit.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Saved Tab */}
        {activeTab === 'saved' && (
          <div>
            {loadingSaved ? (
              <div className="text-center py-12">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Loading saved outfits...</p>
              </div>
            ) : savedOutfits.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No saved outfits yet</h3>
                <p className="text-gray-600 mb-6">Generate some outfits and save your favorites!</p>
                <button onClick={() => setActiveTab('generate')} className="btn-primary">
                  Generate Outfits
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {savedOutfits.map((outfit) => (
                  <OutfitCard
                    key={outfit.id}
                    outfit={outfit}
                    onSave={handleSaveOutfit}
                    onUnsave={handleUnsaveOutfit}
                    isSaved={true}
                  />
                ))}
              </div>
            )}
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

export default OutfitsPage;
