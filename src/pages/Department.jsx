import React from "react";
import { FaUserGraduate, FaChalkboardTeacher, FaFlask, FaTrophy } from "react-icons/fa";

const Department = () => {
  return (
    <section
      id="department"
      className="min-h-screen w-full bg-black relative flex items-center justify-center md:px-4 pt-10 overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,#ff0000_1px,transparent_1px)] [background-size:20px_20px] opacity-10 z-0" />

      {/* Main content */}
      <div className="z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
        
        {/* Left content */}
        <div className="w-full md:w-1/2 md:p-6 p-4 py-6 sm:p-8 md:rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 ring-1 ring-red-400/40 shadow-xl flex flex-col min-h-[500px]">
          <h2 className="text-2xl oi-regular font-bold text-red-400 mb-6 text-center md:text-left">
            About the Department of CSE
          </h2>

          {/* Department Description */}
          <p className="text-gray-200 mb-6 text-justify">
           Department of Computer Science and Engineering programme was
 introduced at Edayathangudy G.S. Pillay Engineering College in the
 Academic Year 1995-1996. It offers UG, PG and Ph.D programme.
 The department has a total strength of 1000+ students along with
 highly qualified experienced faculties. The cse department strongly
 emphasizes the learning of fundamentals and analysis of latest
 technologies to develop student creativity and encourages them to
 take up projects with various levels of complexity.
          </p>
      

          {/* Highlights */}
          <ul className="text-gray-200 space-y-4">
            <li className="flex items-start gap-3">
              <FaUserGraduate className="text-red-400 text-xl mt-1 flex-shrink-0" />
              <span>
                <strong>1000+ students</strong> across UG/PG/Ph.D.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <FaChalkboardTeacher className="text-red-400 text-xl mt-1 flex-shrink-0" />
              <span>
                <strong>Experienced faculty</strong> & active research groups
              </span>
            </li>
            <li className="flex items-start gap-3">
              <FaFlask className="text-red-400 text-xl mt-1 flex-shrink-0" />
              <span>
                Recognized <strong>Research Centre</strong> & funded projects
              </span>
            </li>
            <li className="flex items-start gap-3">
              <FaTrophy className="text-red-400 text-xl mt-1 flex-shrink-0" />
              <span>
                Student clubs, hackathons & prize-winning teams
              </span>
            </li>
          </ul>
        </div>

        {/* Right content - Highlights */}
        <div className="w-full md:w-1/2 md:p-6 p-4 py-6 sm:p-8 md:rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 ring-1 ring-red-400/40 shadow-xl flex flex-col md:min-h-[500px]">
          <h2 className="text-2xl oi-regular font-bold text-red-400 mb-6 text-center md:text-left">
            Highlights Of CSE
          </h2>

          {/* Department Description */}
          <p className="text-gray-200 mb-6 text-justify">
          The Department is a Recognized Research Centre for Ph.D. / M.S.
 (By Research). Obtained Permanent Affiliation from Anna
 University during the year 2014-15. Formed a student association
 named Computer Engineers Association (CEA) to promote the
 talent and upliftment of the students. Well experienced and highly
 qualified faculties Publications in reputed journals and
 conferences.
          </p>

          {/* Additional Highlights */}
          <ul className="text-gray-200 space-y-4">
            <li className="flex items-start gap-3">
              <FaFlask className="text-red-400 text-xl mt-1 flex-shrink-0" />
              <span>
                <strong>Recognized Research Centre</strong> for Ph.D./M.S.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <FaTrophy className="text-red-400 text-xl mt-1 flex-shrink-0" />
              <span>
                <strong>Permanent Affiliation</strong> from Anna University
              </span>
            </li>
            <li className="flex items-start gap-3">
              <FaUserGraduate className="text-red-400 text-xl mt-1 flex-shrink-0" />
              <span>
                <strong>Computer Engineers Association (CEA)</strong> for student development
              </span>
            </li>
            <li className="flex items-start gap-3">
              <FaChalkboardTeacher className="text-red-400 text-xl mt-1 flex-shrink-0" />
              <span>
                <strong>Publications</strong> in reputed journals and conferences
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Department;