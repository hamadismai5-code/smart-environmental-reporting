import {
  Link,
  NavLink,
} from "react-router-dom";

import {
  Leaf,
  Menu,
  X,
  Map,
} from "lucide-react";

import { useState } from "react";


function Navbar() {

  const [menuOpen, setMenuOpen] =
    useState(false);


  const closeMenu = () => {
    setMenuOpen(false);
  };


  return (

    <header className="navbar">

      <div className="navbar-container">


        {/* LOGO */}

        <Link
          to="/"
          className="brand"
          onClick={closeMenu}
        >

          <div className="brand-icon">
            <Leaf size={24} />
          </div>

          <div>

            <div className="brand-name">
              Smart<span>Report</span>
            </div>

            <div className="brand-subtitle">
              Community Reporting
            </div>

          </div>

        </Link>


        {/* NAVIGATION */}

        <nav
          className={`nav-links ${
            menuOpen ? "open" : ""
          }`}
        >

          <NavLink
            to="/"
            end
            onClick={closeMenu}
          >
            Home
          </NavLink>


          <NavLink
            to="/report"
            onClick={closeMenu}
          >
            Report Incident
          </NavLink>


          <NavLink
            to="/track"
            onClick={closeMenu}
          >
            Track Report
          </NavLink>


          <NavLink
            to="/map"
            onClick={closeMenu}
          >
            <Map size={16} />
            Incident Map
          </NavLink>


          <NavLink
            to="/about"
            onClick={closeMenu}
          >
            About
          </NavLink>


          <Link
            to="/report"
            className="nav-report-btn"
            onClick={closeMenu}
          >
            Report Now
          </Link>

        </nav>


        {/* MOBILE BUTTON */}

        <button
          className="mobile-menu-btn"
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
        >

          {menuOpen ? (
            <X size={25} />
          ) : (
            <Menu size={25} />
          )}

        </button>

      </div>

    </header>
  );
}

export default Navbar;