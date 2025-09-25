import React, { useState } from 'react';

const Committee = () => {
  const [activeTab, setActiveTab] = useState('faculty');

  const facultyMembers = [
     {
      role: "Convenor",
      name: "Dr. M. Chinnadurai., Ph.D",
      abbreviation: "Professor/ CSE"
    },
    {
      role: "Head of Department",
      name: "Dr. R. Manivannan., Ph.D",
      abbreviation: "Professor/ CSE"
    },
    {
      role: "Chairperson",
      name: "Dr. M. Priya., Ph.D",
      abbreviation: "Professor/ CSE"
    },
    {
      role: "Co-Chairperson",
      name: "Dr. J. Noorul Ameen., Ph.D",
      abbreviation: "Assistant Professor/ CSE"
    },
    {
      role: "Event Coordinator",
      name: "Dr. N. Murali., Ph.D",
      abbreviation: "Professor/ CSE"
    },
    {
      role: "Event Coordinator",
      name: "Dr. A. Emmanuel Peo Mariadas., Ph.D",
      abbreviation: "Associate Professor/ CSE"
    }
  ];

  const studentMembers = [
    {
      role: "President",
      name: "M. Mohamed Kaleel.,",
      abbreviation: "IV CSE-A"
    },
    {
      role: "President",
      name: "M. Shithik Asath.,",
      abbreviation: "IV CSE- B"
    },
    {
      role: "Vice-President",
      name: "C. Tamilselvan.,",
      abbreviation: "III CSE-A"
    },
     {
      role: "Vice-President",
      name: "J. Vigneshwaran.,",
      abbreviation: "III CSE-C"
    }
    ,
     {
      role: "Secretary",
      name: "D. Mahalakshmi.,",
      abbreviation: "IV CSE-A"
    },
     {
      role: "Secretary",
      name: " S. R. Reshma.,",
      abbreviation: "IV CSE-B"
    }
    ,
     {
      role: "Joint-Secreatary",
      name: "E. Harish.,",
      abbreviation: "III CSE-C"
    },
     {
      role: "Joint-Secreatary",
      name: "M. Ramakrishnan.,",
      abbreviation: "III CSE-B"
    }
  ];

  const members = activeTab === 'faculty' ? facultyMembers : studentMembers;

  return (
    <section id='committee' className="min-h-screen w-full px-4 bg-black relative flex items-center justify-center py-10 overflow-hidden">
      {/* Red Dot Pattern Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,#ff0000_1px,transparent_1px)] [background-size:20px_20px] opacity-10 z-0" />

      {/* Content Container */}
      <div className="z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Header Section */}
        <div className="w-full text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold oi-regular text-red-400 mb-4 ">Organizing Committee</h1>
          <p className="text-gray-300 text-lg">Meet the dedicated faculty and student members organizing this event.</p>
        </div>

        {/* Tab Navigation */}
        <div className="w-full max-w-2xl mb-8">
          <div className="flex bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('faculty')}
              className={`flex-1 py-3 px-1 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'faculty' 
                  ? 'bg-red-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Faculty Members
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`flex-1 py-3 px-1 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'students' 
                  ? 'bg-red-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Student Coordinators
            </button>
          </div>
        </div>

        {/* Committee Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {members.map((member, index) => (
            <div 
              key={index}
              className="group px-4 py-5 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 ring-1 ring-red-400/40 shadow-xl hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105"
            >
              {/* Role Abbreviation Badge */}
              <div className="inline-block bg-red-600 text-white text-sm font-bold py-1 px-3 rounded-lg mb-3">
               {member.role}
              </div>
              
              {/* Member Name */}
              <h3 className="text-xl font-bold text-red-300 mb-2 group-hover:text-red-200 transition-colors">
                {member.name}
              </h3>
              
              {/* Member Role */}
              <p className="text-gray-200 leading-relaxed text-sm">
                 {member.abbreviation}
              </p>
              
            
            </div>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="w-full max-w-4xl p-6 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 ring-1 ring-red-400/40 shadow-xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4 oi-regular">Committee Responsibilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-200">
              <div className="flex items-start justify-">
                <span className="text-red-400 mr-2 text-lg ">•</span>
                <span>Event planning and coordination</span>
              </div>
              <div className="flex items-start justify-">
                <span className="text-red-400 mr-2 text-lg ">•</span>
                <span>Technical and logistical support</span>
              </div>
              <div className="flex items-start justify-">
                <span className="text-red-400 mr-2 text-lg ">•</span>
                <span>Participant guidance and assistance</span>
              </div>
              <div className="flex items-start justify-">
                <span className="text-red-400 mr-2 text-lg ">•</span>
                <span>Judging and evaluation</span>
              </div>
            </div>
            <p className="text-red-300 mt-6 text-sm">
              Our committee is committed to making this event a memorable and successful experience for all participants!
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Committee;