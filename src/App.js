import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Create from "./components/Create";
import { GradientProvider } from "./contexts/GradientContext";

function App() {
  return (
    <Router>
      <GradientProvider>
        <Routes>
          <Route path="/create" element={<Create />} />
          {/* Add other routes as needed */}
        </Routes>
      </GradientProvider>
    </Router>
  );
}

export default App;
