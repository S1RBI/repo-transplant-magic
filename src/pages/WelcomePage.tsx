
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/auth');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-volunteer-purple rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-bold text-3xl">V</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Welcome to Your Blank App</h1>
        <p className="text-gray-600 mb-8">Start building your amazing project here!</p>
        
        <Button 
          onClick={handleLoginClick} 
          className="flex items-center justify-center gap-2 w-full md:w-auto"
          size="lg"
        >
          <LogIn size={20} />
          Войти
        </Button>
      </div>
    </div>
  );
};

export default WelcomePage;
