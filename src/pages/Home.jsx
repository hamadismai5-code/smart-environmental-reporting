import { Link } from "react-router-dom";
import {
  ArrowRight,
  Camera,
  CheckCircle,
  MapPin,
  ShieldCheck,
  BarChart3,
  Clock3,
  Users,
  Leaf,
} from "lucide-react";

function Home() {
  return (
    <main>

      {/* HERO */}

      <section className="hero">

        <div className="hero-overlay"></div>

        <div className="hero-content">

          <div className="hero-badge">
            <Leaf size={16} />
            Smart Community Reporting
          </div>

          <h1>
            Together, We Can Build
            <span> A Better Community.</span>
          </h1>

          <p>
            See an environmental or community problem?
            Report it quickly, safely and anonymously.
            Your report can help authorities take action.
          </p>

          <div className="hero-buttons">

            <Link
              to="/report"
              className="hero-primary-btn"
            >
              Report an Incident
              <ArrowRight size={19} />
            </Link>

            <Link
              to="/track"
              className="hero-secondary-btn"
            >
              Track My Report
            </Link>

          </div>

          <div className="hero-trust">

            <span>
              <CheckCircle size={17} />
              Anonymous
            </span>

            <span>
              <CheckCircle size={17} />
              GPS Location
            </span>

            <span>
              <CheckCircle size={17} />
              Photo Evidence
            </span>

          </div>

        </div>

      </section>


      {/* STATS */}

      <section className="stats-section">

        <div className="stats-container">

          <div className="stat-item">
            <div className="stat-icon">
              <BarChart3 size={23} />
            </div>

            <div>
              <strong>1,284+</strong>
              <span>Reports Submitted</span>
            </div>
          </div>


          <div className="stat-item">
            <div className="stat-icon">
              <CheckCircle size={23} />
            </div>

            <div>
              <strong>950+</strong>
              <span>Issues Resolved</span>
            </div>
          </div>


          <div className="stat-item">
            <div className="stat-icon">
              <Clock3 size={23} />
            </div>

            <div>
              <strong>24/7</strong>
              <span>Reporting Available</span>
            </div>
          </div>


          <div className="stat-item">
            <div className="stat-icon">
              <Users size={23} />
            </div>

            <div>
              <strong>100%</strong>
              <span>Community Focused</span>
            </div>
          </div>

        </div>

      </section>


      {/* HOW IT WORKS */}

      <section className="how-section">

        <div className="section-heading">

          <div className="section-label">
            HOW IT WORKS
          </div>

          <h2>
            Reporting Made Simple
          </h2>

          <p>
            Report a problem in just a few simple steps.
          </p>

        </div>


        <div className="steps-container">

          <div className="step-card">

            <div className="step-number">
              01
            </div>

            <div className="step-icon">
              <Camera size={28} />
            </div>

            <h3>
              Identify the Problem
            </h3>

            <p>
              See an environmental or community
              problem and capture a photo.
            </p>

          </div>


          <div className="step-card">

            <div className="step-number">
              02
            </div>

            <div className="step-icon">
              <MapPin size={28} />
            </div>

            <h3>
              Choose Location
            </h3>

            <p>
              Use GPS or select the exact incident
              location on the interactive map.
            </p>

          </div>


          <div className="step-card">

            <div className="step-number">
              03
            </div>

            <div className="step-icon">
              <ShieldCheck size={28} />
            </div>

            <h3>
              Submit Safely
            </h3>

            <p>
              Submit your report anonymously and
              receive a unique Report ID.
            </p>

          </div>

        </div>

      </section>


      {/* REPORT CATEGORIES */}

      <section className="categories-section">

        <div className="section-heading">

          <div className="section-label">
            WHAT CAN YOU REPORT?
          </div>

          <h2>
            Help Us Keep Your Community Safe
          </h2>

        </div>


        <div className="category-grid">

          <div className="category-card">
            <span>🗑️</span>
            <h3>Garbage Pollution</h3>
            <p>Illegal dumping and waste problems.</p>
          </div>

          <div className="category-card">
            <span>💧</span>
            <h3>Water Pollution</h3>
            <p>Pollution affecting rivers and water sources.</p>
          </div>

          <div className="category-card">
            <span>🛣️</span>
            <h3>Road Damage</h3>
            <p>Damaged roads and dangerous infrastructure.</p>
          </div>

          <div className="category-card">
            <span>💡</span>
            <h3>Street Lights</h3>
            <p>Broken or non-functional street lights.</p>
          </div>

          <div className="category-card">
            <span>🔊</span>
            <h3>Noise Pollution</h3>
            <p>Excessive noise affecting the community.</p>
          </div>

          <div className="category-card">
            <span>🌫️</span>
            <h3>Air Pollution</h3>
            <p>Smoke and other harmful air pollution.</p>
          </div>

        </div>

      </section>


      {/* CTA */}

      <section className="cta-section">

        <div className="cta-content">

          <div className="cta-icon">
            <Leaf size={35} />
          </div>

          <h2>
            See Something That Needs Attention?
          </h2>

          <p>
            Your voice matters. Report it and help make
            your community cleaner, safer and better.
          </p>

          <Link
            to="/report"
            className="cta-button"
          >
            Start Reporting
            <ArrowRight size={19} />
          </Link>

        </div>

      </section>

    </main>
  );
}

export default Home;