import React from "react"
import NavBar from "./components/Navbar"
import Home from "./pages/Home"
import About from "./pages/About"
import Institute from "./pages/Institute"
import Department from "./pages/Department"
import Events from "./pages/Events"
import Committee from "./pages/Committee"
import Faq from "./pages/Faq"
import Contact from "./pages/Contact"
import { useState } from "react"
import MobileNavBar from "./components/MobileNavBar"
import Footer from "./components/Footer"
import {
  MdOutlineKeyboardDoubleArrowRight,
  MdMenu,
  MdClose,
  MdInfo,
  MdSchool,
  MdApartment,
  MdEvent,
  MdGroup,
  MdSchedule,
  MdHelp,
  MdCall,
} from "react-icons/md";
import { FaUserPlus } from 'react-icons/fa';
function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = [
    { name: 'about', path: '#about', icon: <MdInfo /> },
    { name: 'institute', path: '#institute', icon: <MdSchool /> },
    { name: 'events', path: '#events', icon: <MdEvent /> },
    { name: 'committee', path: '#committee', icon: <MdGroup /> },
    { name: 'department', path: '#department', icon: <MdApartment /> },
    { name: 'register', path: import.meta.env.VITE_GOOGLE_SHEET_URL, icon: <FaUserPlus /> },
    { name: 'faq', path: '#faq', icon: <MdHelp /> },
    { name: 'contact', path: '#contact', icon: <MdCall /> },
  ];
  return (
    <main>
      <NavBar navItems={navItems} setMobileOpen={setMobileOpen}/>
      <MobileNavBar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} navItems={navItems}/>
      <Home />
      <About />
      <Institute />
      <Department />
      <Events />
      <Committee />
      <Faq />
      <Contact />
      <Footer/>
    </main>
  )
}

export default App
