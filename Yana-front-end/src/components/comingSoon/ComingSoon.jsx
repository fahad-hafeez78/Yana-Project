import React, { useState, useEffect } from 'react';
import rocket from "../../assets/customIcons/comingSoon/rocket.svg"

const ComingSoonPage = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const launchDate = new Date('2024-12-31T00:00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = launchDate.getTime() - now.getTime();

      if (difference > 0) {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full w-full flex items-center justify-center p-4 font-sans">
      <div className="max-w-xl w-full bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden transform transition-all duration-300 hover:scale-105">
        <div className="p-6 md:p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 text-blue-600">
              <img src={rocket}></img>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4 leading-tight px-2">
            Coming Soon
          </h1>

          <p className="text-gray-600 text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed px-4">
            We're making something extraordinary behind the scenes. 
            Get ready for an incredible experience that will redefine expectations!
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8 px-2">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div
                key={unit}
                className="bg-white/50 backdrop-blur rounded-xl shadow-md p-3 md:p-4 text-center w-20 md:w-24 transform hover:scale-110 transition-all duration-300"
              >
                <div className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  {value.toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  {unit}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;