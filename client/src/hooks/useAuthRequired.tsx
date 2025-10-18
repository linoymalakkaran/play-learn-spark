import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  isOpen,
  onClose,
  feature
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    navigate('/login');
    onClose();
  };

  const handleRegister = () => {
    navigate('/register');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-4 bg-white border-2 border-purple-200 shadow-2xl">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-xl font-['Fredoka_One'] text-purple-700 mb-2">
              Account Required
            </h2>
            <p className="text-sm font-['Comic_Neue'] text-gray-600 mb-4">
              To use <strong>{feature}</strong>, you need to create an account. 
              This helps us save your progress and provide personalized features!
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-['Fredoka_One'] py-3 rounded-xl"
              >
                🚪 Log In
              </Button>
              
              <Button
                onClick={handleRegister}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-['Fredoka_One'] py-3 rounded-xl"
              >
                🌟 Create Account
              </Button>
              
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full font-['Comic_Neue'] border-2 border-gray-300 hover:border-gray-400"
              >
                Maybe Later
              </Button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-['Comic_Neue'] text-blue-600">
                ✨ <strong>Don't worry!</strong> You can still enjoy all the learning games and activities as a guest. 
                Your progress will be saved on this device only.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Hook for easy usage
export const useAuthRequired = () => {
  const { requiresAuth, isGuest } = useAuth();
  const [modalData, setModalData] = React.useState<{
    isOpen: boolean;
    feature: string;
  }>({
    isOpen: false,
    feature: ''
  });

  const checkFeatureAccess = (feature: string) => {
    const result = requiresAuth(feature);
    
    if (!result.allowed && isGuest) {
      setModalData({
        isOpen: true,
        feature: feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      });
      return false;
    }
    
    return true;
  };

  const closeModal = () => {
    setModalData(prev => ({ ...prev, isOpen: false }));
  };

  return {
    checkFeatureAccess,
    AuthRequiredModal: (
      <AuthRequiredModal
        isOpen={modalData.isOpen}
        onClose={closeModal}
        feature={modalData.feature}
      />
    )
  };
};