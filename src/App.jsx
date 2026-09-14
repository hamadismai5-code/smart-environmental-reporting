import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import AdminApp from "./admin/AdminApp";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import ReportIncident from "./pages/ReportIncident";
import TrackReport from "./pages/TrackReport";
import IncidentMap from "./pages/IncidentMap";
import About from "./pages/About";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/report"
          element={<ReportIncident />}
        />

        <Route
          path="/track"
          element={<TrackReport />}
        />

        <Route
          path="/map"
          element={<IncidentMap />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/admin"
          element={<AdminApp />}
       />

      </Routes>

    </BrowserRouter>
  );
}

export default App;