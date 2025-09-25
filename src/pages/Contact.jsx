import React from 'react';

const Contact = () => {
  const contactInfo = [
    {
      label: "Email",
      value: "infxtron@egspec.org",
      href: "mailto:infxtron@egspec.org"
    },
    {
      label: "Website",
      value: "infxtron.onrender.com",
      href: "https://infxtron.onrender.com"
    },
    {
      label: "Phone",
      value: "9342454966",
      href: "tel:+919342454966"
    }
    ,
    {
      label: "Phone",
      value: "8608250530",
      href: "tel:+918608250530"
    },
    {
      label: "Address",
      value: "OLD NAQORE ROAD, NAGAPATTINAM",
      href: "https://maps.google.com/?q=OLD+NAQORE+ROAD,NAGAPATTINAM"
    }
  ];

  return (
    <section id='contact' className="min-h-screen w-full bg-black relative flex items-center justify-center md:px-4 py-10 overflow-hidden">
      {/* Red Dot Pattern Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,#ff0000_1px,transparent_1px)] [background-size:20px_20px] opacity-10 z-0" />

      {/* Content Container */}
      <div className="z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">

        {/* Left Side Content */}
        <div className="w-full md:w-1/2 md:p-6 p-4 py-6 sm:p-8 md:rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 ring-1 ring-red-400/40 shadow-xl flex flex-col md:min-h-[500px]">
          <h2 className="text-2xl oi-regular font-bold text-red-400 mb-6 text-center md:text-left">Contact Us</h2>
          
          <div className="flex-grow space-y-6">
            {contactInfo.map((item, index) => (
              <div key={index} className="flex items-start">
                <span className="text-red-400 mr-3 text-lg mt-1">•</span>
                <div>
                  <p className="text-red-300 font-semibold">{item.label}</p>
                  <a 
                    href={item.href} 
                    className="text-gray-200 hover:text-red-300 transition-colors duration-300"
                    target={item.href.startsWith('http') ? '_blank' : '_self'}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : ''}
                  >
                    {item.value}
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/20">
            <p className="text-red-300 text-sm text-center md:text-left">
              Reach out to us for any queries about INFxTRON'25!
            </p>
          </div>
        </div>

        {/* Right Side - Map */}
        <div className="w-full md:w-1/2 md:h-[500px] h-[350px] md:rounded-2xl overflow-hidden shadow-xl border border-white/20 ring-1 ring-red-400/40">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3271.018901286319!2d79.8332637!3d10.8037224!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a556ca2018f1961%3A0xa99f9848f54a5c9!2sEGS%20Pillay%20Engineering%20College(Autonomous)!5e1!3m2!1sen!2sin!4v1758728653982!5m2!1sen!2sin" 
            width="100%" 
            height="100%" 
            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(85%)' }}
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Institute Location Map"
            className="grayscale opacity-90"
          >
          </iframe>
        </div>
        
      </div>
    </section>
  );
};

export default Contact;