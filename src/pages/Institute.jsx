import React from 'react';
import instituteImage from '/egspec.webp';

const Institute = () => {
  const certifications = [
    { name: 'NIRF', src: '/NIRF.webp' },
    { name: 'NBA', src: '/NBA.webp' },
    { name: 'AICTE', src: '/AICTE.png' },
    { name: 'PTK', src: '/PTK.webp' },
  ];

  return (
    <section id="institute" className="min-h-screen w-full bg-black relative flex items-center justify-center md:px-4 pt-10 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,#ff0000_1px,transparent_1px)] [background-size:20px_20px] opacity-10 z-0" />

      {/* Main content */}
      <div className="z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">

        {/* Left content */}
        <div className="w-full md:w-1/2 md:p-6 p-4 py-6 sm:p-8 md:rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 ring-1 ring-red-400/40 shadow-xl flex flex-col min-h-[500px]">
          <h2 className="text-2xl font-bold text-red-400 mb-6 text-center oi-regular md:text-left">About the Institute</h2>
          <p className="text-gray-200 mb-6 text-justify">
          E.G.S. Pillay Engineering College is one of the pioneering non-grant
 engineering Colleges in the State. It was established by the G. S.
 Pillay & Sons Educational and Charitable Trust, Nagapattinam in
 the year of 1995 with the sanction of the Government of Tamilnadu
 and approval of the AICTE, New Delhi and affiliation to
 Bharathidasan University, Tiruchirapalli. The college has been
 affiliated with Anna University, Chennai, since 2002, the college
 has its degrees awarded by the Anna University, as per
 Government Orders.</p>
 
          <div className="flex flex-wrap md:gap-4 gap-0.5 mt-auto">
            {certifications.map((cert, idx) => (
              <div key={idx} className="flex flex-col items-center w-20">
                <img src={cert.src} alt={cert.name} className="w-12 h-12 object-contain mb-1" />
                <span className="text-xs text-gray-300">{cert.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right content - Image */}
        <div className="w-full md:w-1/2 md:p-6 p-4 py-6 sm:p-8 md:rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 ring-1 ring-red-400/40 shadow-xl flex items-center justify-center md:min-h-[500px]">
  <div className="relative w-full h-full">
    <img
      src={instituteImage}
      alt="Institute"
      className="rounded-xl shadow-lg object-cover w-full h-full"
    />
    {/* Black Overlay */}
    <div className="absolute inset-0 bg-black/20 rounded-xl"></div>
  </div>
</div>


      </div>
    </section>
  );
};

export default Institute;
