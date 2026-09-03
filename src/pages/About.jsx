import {
  ShieldCheck,
  MapPin,
  Camera,
  Users,
  Target,
  ArrowRight,
} from "lucide-react";

import { Link } from "react-router-dom";


function About() {

  return (

    <main className="about-page">

      <section className="about-hero">

        <div className="section-label">
          ABOUT SMARTREPORT
        </div>

        <h1>
          Technology for a
          <span> Better Community</span>
        </h1>

        <p>
          SmartReport is a digital platform designed to
          connect citizens with municipal authorities
          through simple, anonymous and location-based
          incident reporting.
        </p>

      </section>


      <section className="about-content">

        <div className="about-introduction">

          <div className="about-icon">
            <Target size={30} />
          </div>

          <div>

            <h2>
              Our Mission
            </h2>

            <p>
              To make it easier for communities to report
              environmental and social problems while
              helping authorities respond faster and make
              better decisions.
            </p>

          </div>

        </div>


        <div className="about-features">

          <div className="about-feature">

            <ShieldCheck size={27} />

            <h3>
              Anonymous Reporting
            </h3>

            <p>
              Citizens can report incidents without
              providing their personal identity.
            </p>

          </div>


          <div className="about-feature">

            <MapPin size={27} />

            <h3>
              Smart Location
            </h3>

            <p>
              GPS and interactive maps help identify
              the exact location of an incident.
            </p>

          </div>


          <div className="about-feature">

            <Camera size={27} />

            <h3>
              Photo Evidence
            </h3>

            <p>
              Citizens can attach photos to help authorities
              understand the reported problem.
            </p>

          </div>


          <div className="about-feature">

            <Users size={27} />

            <h3>
              Community Focused
            </h3>

            <p>
              The platform creates a direct connection
              between citizens and local authorities.
            </p>

          </div>

        </div>


        <div className="objectives">

          <div>

            <div className="section-label">
              OBJECTIVES
            </div>

            <h2>
              What SmartReport Aims to Achieve
            </h2>

          </div>

          <ul>

            <li>
              Improve community participation.
            </li>

            <li>
              Make incident reporting faster and easier.
            </li>

            <li>
              Help authorities identify problem hotspots.
            </li>

            <li>
              Improve transparency through report tracking.
            </li>

            <li>
              Support data-driven municipal decision making.
            </li>

          </ul>

        </div>


        <div className="about-cta">

          <h2>
            Help Improve Your Community
          </h2>

          <p>
            See a problem? Report it and help authorities
            take action.
          </p>

          <Link to="/report">
            Report an Incident
            <ArrowRight size={18} />
          </Link>

        </div>

      </section>

    </main>
  );
}

export default About;
