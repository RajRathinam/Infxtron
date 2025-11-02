import React from 'react';

const About = () => {
  return (
    <section
      id="about"
      className="min-h-screen relative flex flex-col gap-6 md:flex-row items-center justify-center px-6 md:px-16 py-5 overflow-hidden bg-gradient-to-b from-green-50 to-white"
    >


      {/* left Side - Text */}
      <div className="flex-1 flex flex-col justify-center items-start space-y-4 text-gray-700 max-w-lg z-10">
        <span className="text-2xl dancing-script text-orange-600 font-semibold">
          About Us
        </span>
        <h2 className="text-4xl font-extrabold text-[#6dce00]/80 ubuntu leading-tight">
          We Believe in Real, Wholesome Food
        </h2>
        <p className="text-xs text-justify leading-relaxed">
          At <strong>AG’s Healthy Food</strong>, our mission is to bring nature’s purest
          produce directly to your plate. Every fruit, vegetable, and product we
          offer is grown organically, ensuring freshness and sustainability.
        </p>
        <p className="text-xs text-justify leading-relaxed">
          We work closely with local farmers and eco-conscious producers who
          share our vision for a greener future. Because when food is grown with
          love and care — you can taste the difference.
        </p>
      </div>
            {/* right Side - Image */}
      <div className="flex-1 flex justify-center mb-10 md:mb-0 relative">
        <img
          src="/assets/8.png"
          alt="About Healthy Food"
          className="w-full h-auto rounded-xl object-cover z-10"
        />
        <img
          src="/assets/16.png"
          alt="Decorative Leaf"
          className="absolute -top-10 -left-8 w-35  animate-pulse"
        />
        <img
          src="/assets/10.png"
          alt="Decorative Fruit"
          className="absolute -bottom-15 -right-10 w-40 z-20 rotate-12"
        />
      </div>

      {/* Decorative Background Image */}
      <img
        src="/assets/11.png"
        alt="decorative background"
        className="absolute top-0 left-0 w-[400px] md:w-[600px] opacity-10 pointer-events-none select-none"
      />
    </section>
  );
};

export default About;
