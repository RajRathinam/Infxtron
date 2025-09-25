import React, { useState } from 'react';
import { 
  FaLightbulb, 
  FaPuzzlePiece, 
  FaCode, 
  FaUsers, 
  FaTimes, 
  FaClock, 
  FaUserFriends, 
  FaTrophy,
  FaFileAlt,
  FaStopwatch,
  FaUser
} from 'react-icons/fa';
import { GiBrain, GiRunningShoe } from 'react-icons/gi';

const Events = () => {
  const [activeTab, setActiveTab] = useState('technical');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const technicalEvents = [
    {
      id: 1,
      title: "Paper Presentation",
      subtitle: "IDEAS IGNITE INNOVATION",
      description: "Showcase your research ideas with peers and experts.",
      icon: <FaLightbulb className="text-4xl text-red-400 mb-4" />,
      details: {
        objective: "Encourage students to research, innovate, and present their technical ideas effectively. Nurture critical thinking, academic writing, and presentation capabilities.",
        structure: [
          {
            round: "Round 1 - Abstract Submission",
            duration: "Pre-event",
            description: "Submit an abstract (250-300 words) on emerging CS topics. Best abstracts shortlisted for final round."
          },
          {
            round: "Round 2 - Paper Presentation",
            duration: "7 min presentation + 3 min Q&A",
            description: "Shortlisted teams present their paper using slides (max 12 slides)."
          }
        ],
        rules: [
          "Participation can be solo or in teams of two",
          "Topics must be relevant to Computer Science",
          "Presentation slides must not exceed 12 slides",
          "Plagiarism is strictly prohibited",
          "No internet or AI tools during presentation"
        ],
        participants: "Individuals or teams of 2"
      }
    },
    {
      id: 2,
      title: "Puzzle Bytes",
      subtitle: "QUIZ MEETS PUZZLE",
      description: "Solve challenging puzzles and logical problems together.",
      icon: <FaPuzzlePiece className="text-4xl text-red-400 mb-4" />,
      details: {
        objective: "Assess participants' theoretical knowledge and logical application through innovative problem formats combining technical crossword with reverse output puzzles.",
        structure: [
          {
            round: "Round 1 - Tech Crossword",
            duration: "10-12 mins",
            description: "Crossword grid with clues from core CS subjects (Programming, OS, DBMS, CN, AI)"
          },
          {
            round: "Round 2 - Reverse Output",
            duration: "15 mins",
            description: "Deduce possible problem statement from given output (e.g., Output: 153 → Armstrong number check)"
          }
        ],
        rules: [
          "Solo or teams of two",
          "No mobile phones, internet, or AI tools",
          "Pen-and-paper responses only",
          "Coordinators' decision is final"
        ],
        participants: "Individuals or teams of 2"
      }
    },
    {
      id: 3,
      title: "Code Storm",
      subtitle: "BREAK THE BUGS. BUILD THE LOGIC.",
      description: "Compete in intense coding challenges against others.",
      icon: <FaCode className="text-4xl text-red-400 mb-4" />,
      details: {
        objective: "Enhance problem-solving skills, logical reasoning, and coding efficiency under time constraints through debugging and coding-from-scratch challenges.",
        structure: [
          {
            round: "Round 1 - BugSmash",
            duration: "15 minutes",
            description: "Debug 3 buggy C programs (Fibonacci, Factorial, Palindrome) with intentional errors"
          },
          {
            round: "Round 2 - Logic Lords",
            duration: "15 minutes",
            description: "Write complete C program from story-style problem statement"
          }
        ],
        rules: [
          "Solo or teams of two",
          "Programming Language: C only",
          "No internet, AI tools, or external help",
          "First to produce correct output wins",
          "Code accuracy and efficiency considered for ties"
        ],
        participants: "Individuals or teams of 2"
      }
    },
    {
      id: 4,
      title: "Techizards",
      subtitle: "UNLEASH THE SPELLS OF TECHNOLOGY",
      description: "Display your tech skills through creative projects.",
      icon: <FaUsers className="text-4xl text-red-400 mb-4" />,
      details: {
        objective: "Engage students in a unique, fun-filled technical relay game combining logical reasoning, problem-solving, quick thinking, and creativity in a magical quest format.",
        structure: [
          { round: "Stage 1 - Emoji Enchantments", duration: "3 mins", description: "Solve emoji puzzles representing tech terms" },
          { round: "Stage 2 - Meme Mystica", duration: "5 mins", description: "Interpret tech-themed memes for hidden concepts" },
          { round: "Stage 3 - Sketchcraft", duration: "5 mins", description: "Pictionary-style tech term sketching" },
          { round: "Stage 4 - Debug Dragons", duration: "10 mins", description: "Debug short buggy Python programs" },
          { round: "Stage 5 - QR Spell Hunt", duration: "10 mins", description: "QR code algorithm identification quest" }
        ],
        rules: [
          "Teams of 2 participants",
          "No internet, AI tools, or external help",
          "Relay format - only successful teams advance",
          "Fastest team mastering all spells wins"
        ],
        participants: "Teams of 2"
      }
    }
  ];

  const nonTechnicalEvents = [
    {
      id: 5,
      title: "Connection",
      subtitle: "Everything is Connected",
      description: "Build teamwork and bond through interactive activities.",
      icon: <GiBrain className="text-4xl text-red-400 mb-4" />,
      details: {
        objective: "Provide a refreshing break from academic sessions while keeping the atmosphere lively and enjoyable through connection-based puzzles.",
        structure: [
          { round: "Level 1: General Connection", duration: "10-15 mins", description: "Identify common connection from images/clues (e.g., movie names)" },
          { round: "Level 2: Advanced/Speed Round", duration: "5-10 mins", description: "Trickier clues with shorter time frame (e.g., song names)" },
          { round: "Level 3: Final Showdown", duration: "1-5 mins", description: "High-difficulty clues with BGM snippet identification" }
        ],
        rules: [
          "Accuracy and speed determine progression",
          "Individual participation within the chain",
          "Fair play is mandatory",
          "Buzz-in system for final round"
        ],
        participants: "Individuals or teams"
      }
    },
    {
      id: 6,
      title: "Minute to Win It",
      subtitle: "Sixty seconds Endless Fun",
      description: "Test your quick skills in fun and exciting games.",
      icon: <FaLightbulb className="text-4xl text-red-400 mb-4" />,
      details: {
        objective: "Engage participants in quick, one-minute coordination and focus challenges that energize the symposium atmosphere.",
        structure: [
          { round: "Level 1: Separation Anxiety", duration: "1 min", description: "Sort colored gems into cups (3 participants → 2 advance)" },
          { round: "Level 2: Change the Order", duration: "1 min", description: "Rearrange paper cup pyramid (2 participants → 1 advances)" },
          { round: "Level 3: Chopstick & Coin", duration: "1 min", description: "Pick up coins with chopsticks using one hand" }
        ],
        rules: [
          "1 minute time limit per level",
          "Individual participation",
          "Progress based on completion time",
          "Fair play mandatory"
        ],
        participants: "Individuals"
      }
    },
    {
      id: 7,
      title: "Just Imagine",
      subtitle: "Gesture Speaks Louder",
      description: "Spark creativity through non-verbal communication.",
      icon: <GiRunningShoe className="text-4xl text-red-400 mb-4" />,
      details: {
        objective: "Spark creativity and strengthen non-verbal communication by conveying ideas through gestures within limited time.",
        structure: [
          { round: "Round 1", duration: "2 mins", description: "Guess words/phrases from partner's gestures" },
          { round: "Round 2", duration: "1.5 mins", description: "Same format with reduced time" }
        ],
        rules: [
          "Teams of two participants",
          "Gestures only - no speaking or lip-sync",
          "Cheating leads to disqualification",
          "Lesser time for correct answer qualifies"
        ],
        participants: "Teams of 2"
      }
    },
    {
      id: 8,
      title: "Focus Fiesta",
      subtitle: "Balance Aim Triumph",
      description: "Participate in concentration games and mental challenges.",
      icon: <GiRunningShoe className="text-4xl text-red-400 mb-4" />,
      details: {
        objective: "Build concentration, balance, and teamwork through light, skill-based tasks demanding precision and cooperation.",
        structure: [
          { round: "Level 1", duration: "2 mins", description: "Team of 3: pyramid building, balloon inflation, and knockdown" },
          { round: "Level 2", duration: "1 min", description: "Individual: balance ball while arranging cup pyramid" }
        ],
        rules: [
          "Level 1: Teams of 3 members",
          "Level 2: Only 1 member from winning team",
          "Cheating leads to disqualification",
          "Time limits strictly enforced"
        ],
        participants: "Teams of 3 (Level 1), Individuals (Level 2)"
      }
    }
  ];

  const events = activeTab === 'technical' ? technicalEvents : nonTechnicalEvents;

  const EventModal = ({ event, onClose }) => {
    if (!event) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-black/80 via-red-950/20 to-black/80 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-red-500/50 backdrop-blur-2xl shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-900/40 to-red-800/30 p-6 rounded-t-2xl border-b border-red-500/50 backdrop-blur-md">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-white oi-regular drop-shadow-lg">{event.title}</h2>
                <p className="text-red-300/90 text-lg mt-1 font-medium">{event.subtitle}</p>
              </div>
              <button 
                onClick={onClose}
                className="text-white hover:text-red-300 transition-all duration-300 p-2 rounded-full hover:bg-red-900/30"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* Objective */}
            <section className="bg-black/40 rounded-xl p-4 border border-red-500/30 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-red-400 mb-3 flex items-center">
                <FaLightbulb className="mr-2 text-red-400" /> Objective
              </h3>
              <p className="text-gray-200 leading-relaxed">{event.details.objective}</p>
            </section>

            {/* Event Structure */}
            <section className="bg-black/40 rounded-xl p-4 border border-red-500/30 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-red-400 mb-3 flex items-center">
                <FaClock className="mr-2 text-red-400" /> Event Structure
              </h3>
              <div className="space-y-4">
                {event.details.structure.map((round, index) => (
                  <div key={index} className="bg-gradient-to-r from-red-950/30 to-black/50 p-4 rounded-lg border border-red-500/20 backdrop-blur-sm">
                    <div className="flex flex-col justify-between items-start gap-3 mb-2">
                      <span className="bg-red-600/80 text-white px-3 py-1 rounded-md text-sm font-medium border border-red-400/30">
                        {round.duration}
                      </span>
                      <h4 className="font-semibold text-white drop-shadow-sm">{round.round}</h4>
                    </div>
                    <p className="text-gray-200 text-sm leading-relaxed">{round.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Rules */}
            <section className="bg-black/40 rounded-xl p-4 border border-red-500/30 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-red-400 mb-3 flex items-center">
                <FaUserFriends className="mr-2 text-red-400" /> Rules & Guidelines
              </h3>
              <ul className="space-y-3">
                {event.details.rules.map((rule, index) => (
                  <li key={index} className="text-gray-200 flex items-start">
                    <span className="text-red-400 mr-3 mt-1">•</span>
                    <span className="leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Requirements & Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
              <div className="bg-gradient-to-br from-red-950/30 to-black/40 p-4 rounded-xl border border-red-500/30 backdrop-blur-sm">
                <h4 className="font-semibold text-red-400 mb-2 flex items-center">
                  <FaUser className="mr-2 text-red-400" />
                  Participants
                </h4>
                <p className="text-gray-200 ml-6 text-sm leading-relaxed">{event.details.participants}</p>
              </div>
            </div>

            {/* Prize Info */}
            <div className="bg-gradient-to-r from-red-900/40 to-red-800/30 p-4 rounded-xl border border-red-500/50 backdrop-blur-md">
              <div className="flex items-center text-red-300 mb-3">
                <FaTrophy className="mr-3 text-2xl text-yellow-400 drop-shadow-sm" />
                <span className="font-bold text-lg text-white drop-shadow-sm">Exciting Prizes Await!</span>
              </div>
              <p className="text-gray-200 text-sm leading-relaxed">
                Winners will receive certificates, shields, and special prizes. Don't miss this opportunity to showcase your skills!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id='events' className="min-h-screen w-full px-4 bg-black relative flex items-center justify-center py-10 overflow-hidden">
      {/* Red Dot Pattern Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,#ff0000_1px,transparent_1px)] [background-size:20px_20px] opacity-10 z-0" />

      {/* Content Container */}
      <div className="z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Header Section */}
        <div className="w-full text-center mb-8">
          <h1 className="text-3xl md:text-4xl oi-regular font-bold text-red-400 mb-4">Events</h1>
          <p className="text-gray-300 text-lg">Browse technical & non-technical events. Click "Know more" for rules/prizes.</p>
        </div>

        {/* Tab Navigation */}
        <div className="w-full max-w-2xl mb-8">
          <div className="flex bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('technical')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'technical' 
                  ? 'bg-red-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Technical 
            </button>
            <button
              onClick={() => setActiveTab('non-technical')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'non-technical' 
                  ? 'bg-red-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Non-Technical 
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {events.map((event) => (
            <div 
              key={event.id}
              className="group p-6 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 ring-1 ring-red-400/40 shadow-xl hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105"
            >
              {/* Event Icon */}
              <div className="flex justify-center mb-2">
                {event.icon}
              </div>
              
              {/* Event Title */}
              <h3 className="text-xl oi-regular font-bold text-red-300 mb-1 group-hover:text-red-200 transition-colors">
                {event.title}
              </h3>
              <p className="text-red-400/80 text-sm mb-3">{event.subtitle}</p>
              
              {/* Event Description */}
              <p className="text-gray-200 mb-4 leading-relaxed text-sm">
                {event.description}
              </p>
              
              {/* Know More Button */}
              <button 
                onClick={() => openModal(event)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:translate-y-[-2px] shadow-md hover:shadow-lg"
              >
                Know more
              </button>
            </div>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="w-full max-w-4xl p-6 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 ring-1 ring-red-400/40 shadow-xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-400 oi-regular mb-4">Event Highlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-200">
              <div className="flex items-center justify-center">
                <FaTrophy className="text-red-400 mr-2" />
                <span>Exciting Prizes</span>
              </div>
              <div className="flex items-center justify-center">
                <FaUserFriends className="text-red-400 mr-2" />
                <span>Expert Judging Panel</span>
              </div>
              <div className="flex items-center justify-center">
                <FaUsers className="text-red-400 mr-2" />
                <span>Networking Opportunities</span>
              </div>
            </div>
            <p className="text-red-300 mt-6 text-sm">
              Don't miss this opportunity to showcase your skills and learn from the best!
            </p>
          </div>
        </div>

      </div>

      {/* Event Detail Modal */}
      {isModalOpen && (
        <EventModal 
          event={selectedEvent} 
          onClose={closeModal} 
        />
      )}
    </section>
  );
};

export default Events;