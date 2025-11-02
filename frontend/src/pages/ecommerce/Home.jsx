import React from "react";
import About from "./About";
import Contact from "./Contact";
import Products from "./Products";

export default function Home() {
  return (
    <div>
      {/* Home Section */}
<section
  id="home"
  className="min-h-screen bg-gradient-to-b from-green-50 to-white relative py-10 flex flex-col md:flex-row items-center justify-center px-4 md:px-16"
>
  {/* Left Side (Text) */}
  <div className="flex-1 flex px-2 flex-col justify-center items-start">
    <span className="text-2xl dancing-script text-orange-600 font-semibold">
      Nature’s Taste, Pure & Fresh
    </span>
    <h1 className="text-4xl font-extrabold text-[#6dce00]/80 leading-tight ubuntu">
      AG’s Healthy Food
    </h1>
    <span className="text-sm uppercase text-orange-500 mt-4 tracking-widest font-semibold">
      Organic | Fresh | Sustainable
    </span>
    <p className="text-gray-700 max-w-md text-xs ubuntu">
      Discover wholesome and organic products grown with care.  
      Bringing nature’s best to your table with love and trust.
    </p>
  </div>

  {/* Right Side (Images) */}
  <div className="relative flex-1 flex flex-col items-center justify-start gap-6 mt-8 md:mt-0">
    <div className="flex gap-6">
      <img
        src="/assets/8.png"
        alt="Fresh Vegetables"
        className="w-72 hidden md:block h-100 z-10 object-cover rounded-2xl shadow-lg"
      />
      <img
        src="/assets/9.png"
        alt="Organic Juice"
        className="w-72 h-100 object-cover z-10 rounded-2xl shadow-lg"
      />
    </div>
    <img src="/assets/15.png" alt="decorative asset" className="absolute -left-30 -top-5"/>
    <img src="/assets/10.png" alt="decorative asset" className="absolute -left-20 z-20 w-50 h-auto -bottom-10"/>
    <img src="/assets/11.png" alt="decorative asset" className="absolute -right-5 z-20 w-40 h-auto -top-10"/>

  </div>
          {/* Decorative asset (clipped to header only) */}
        <img
          src="/assets/12.png"
          alt="decorative asset"
          className="
        absolute 
       top-0
       right-0
        w-[500px] 
        md:w-[550px] 
        h-auto 
        pointer-events-none 
        select-none 
        z-0
      "
        />
</section>

      {/* Products Section */}
      <section id="products">
        <Products />
      </section>

      {/* About Section */}
      <section id="about">
        <About />
      </section>

      {/* Contact Section */}
      <section id="contact">
        <Contact />
      </section>
    </div>
  );
}
