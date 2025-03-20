import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from '../../assets/logo.png';

function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-white text-black">
      <img src='/Yana Logo.png' alt="YANA Logo" className="max-w-1/2 max-h-1/2" />
      {/* <h1 className="text-3xl mb-2">YANA</h1>
      <p className="text-xl">You Are Never Alone</p> */}
    </div>
  );
}

export default SplashScreen;