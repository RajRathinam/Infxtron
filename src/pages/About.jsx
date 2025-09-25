import React, { useEffect, useState } from 'react';

const About = () => {
  const targetDate = new Date('2025-10-10T00:00:00').getTime();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [currentDateTime, setCurrentDateTime] = useState({
    date: '',
    day: '',
    time: ''
  });

  useEffect(() => {
    // Function to update current date and time
    const updateCurrentDateTime = () => {
      const now = new Date();
      const date = now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const day = now.toLocaleDateString('en-US', { weekday: 'long' });
      const time = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      
      setCurrentDateTime({ date, day, time });
    };

    // Initial update
    updateCurrentDateTime();
    
    // Update every minute
    const interval = setInterval(updateCurrentDateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });

      if (distance < 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id='about' className="min-h-screen w-full bg-black relative flex items-center justify-center md:px-4 pt-10 overflow-hidden">
      {/* Red Dot Pattern Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,#ff0000_1px,transparent_1px)] [background-size:20px_20px] opacity-10 z-0" />

      {/* Content Container */}
      <div className="z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">

        {/* Left Side Content */}
        <div className="w-full md:w-1/2 md:p-6 p-4 py-6 sm:p-8 md:rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 ring-1 ring-red-400/40 shadow-xl flex flex-col min-h-[500px]">
          <h2 className="text-2xl font-bold text-red-400 mb-6 text-center oi-regular md:text-left">About the Symposium</h2>
          
          <div className="flex-grow">
            <p className="text-gray-200 mb-4 text-justify">
          On the grand occasion of <strong className="text-red-300">INFXTRON'25</strong>, the International Level
 Technical Symposium on October 10th, 2025, the CSE department is
 hosting exciting events. This symposium introduces students to
 emerging trends, testing them with unique technical problems. It
 aims at exposing the budding engineers with numerous recent and
 upcoming trends in various domains, challenging the young brains
 to solve technical problems, by interacting with peer. The theme of
 <strong className="text-red-300">{" "}INFXTRON'25</strong> is "<strong className="text-red-300">Infinite Innovations</strong>". </p>
            
            <p className="font-bold text-red-300 mb-4 text-center md:text-left">Theme: Infinite Innovations.</p>
            
            <ul className="space-y-3 text-gray-200">
              <li className="flex items-start">
                <span className="text-red-400 mr-2 text-lg">•</span>
                <span>Hands-on workshops & technical competitions</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-2 text-lg">•</span>
                <span>Industry-oriented challenges & prizes</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-2 text-lg">•</span>
                <span>Networking with peers, faculty, and guests</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-2 text-lg">•</span>
                <span>Certificates for participants & winners</span>
              </li>
            </ul>
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/20">
            <p className="text-red-300 text-sm text-center md:text-left">
              Join us for a day of innovation and technological exploration!
            </p>
          </div>
        </div>

        {/* Right Side Content */}
        <div className="w-full md:w-1/2 md:p-13 p-4 py-6 sm:p-8 md:rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 ring-1 ring-red-400/40 shadow-xl flex flex-col items-center md:min-h-[500px]">
          <p className="text-xs sm:text-sm tracking-widest text-red-300 uppercase mb-2 text-center md:text-left">
            International Level Technical Symposium
          </p>

          <h1 className="text-2xl oi-regular flex flex-col items-center sm:text-3xl md:text-4xl font-extrabold text-red-500 mb-4 text-center md:text-left leading-tight">
           <span> INFxTRON’25</span>
            <span> “Infinite Innovations”</span>
          </h1>

          <p className="flex flex-wrap justify-center md:justify-start items-center gap-2 text-gray-200 mb-4 text-sm sm:text-base">
             October 10, 2025 •  CSE Department, EGSPEC
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap justify-between md:justify-start gap-4 mb-6">
            <a href={import.meta.env.VITE_GOOGLE_SHEET_URL} target="_blank" 
  rel="noopener noreferrer" className="bg-red-600 cursor-pointer hover:bg-red-700 transition text-white px-7 py-2.5 rounded-lg font-semibold shadow-md text-sm sm:text-base">
              Register Now
            </a>
            <a href='#events' className="border cursor-pointer border-red-400 text-red-300 hover:bg-red-500 hover:text-white transition px-7 py-2.5 rounded-lg font-semibold shadow-md text-sm sm:text-base">
              View Events
            </a>
          </div>

          <div className="px-10">
            {/* Current Date and Time Display */}
          <div className="w-full mb-6 flex justify-center">
            <div className="p-4 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 ring-1 ring-red-400/40 shadow-md text-white text-center w-full">
              <div className="text-lg font-semibold text-red-300">{currentDateTime.day}</div>
              <div className="text-sm text-gray-200">{currentDateTime.date}</div>
              {/* <div className="text-md font-medium text-red-200 mt-1">{currentDateTime.time}</div> */}
            </div>
          </div>

          {/* Countdown */}
          <div className="flex justify-center md:justify-between w-full gap-3 sm:gap-4 text-center font-bold mt-auto">
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Minutes', value: timeLeft.minutes },
              { label: 'Seconds', value: timeLeft.seconds }
            ].map((item, index) => (
              <div key={index} className="w-16 sm:w-20 p-3 sm:p-4 bg-white/10 border border-white/20 rounded-xl text-white shadow-md">
                <div className="text-xl sm:text-2xl">{item.value}</div>
                <div className="text-xs sm:text-sm">{item.label}</div>
              </div>
            ))}
          </div>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default About;