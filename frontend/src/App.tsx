


import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import PoolsPage from "./pages/PoolsPage";
import PoolDetails from "./pages/PoolDetails";
import DocsPage from "./pages/DocsPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-green-500 font-mono">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pools" element={<PoolsPage />} />
          <Route path="/pool/:chainId/:poolname" element={<PoolDetails />} />
          <Route path="/docs" element={<DocsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

