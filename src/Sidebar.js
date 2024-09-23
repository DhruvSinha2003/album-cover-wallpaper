import React, { useState } from "react";

export default function Sidebar({ onSizeChange }) {
  const [sidebarToggle, setSidebarToggle] = useState(0);

  const handleSizeChange = (width, height) => {
    onSizeChange({ width, height });
  };

  return (
    <div className="sidebar">
      {sidebarToggle ? (
        <button onClick={() => setSidebarToggle(0)}>Open Sidebar</button>
      ) : (
        <div>
          <button onClick={() => setSidebarToggle(1)}>Close Sidebar</button>
          <h3>Canvas Size</h3>
          <button onClick={() => handleSizeChange(1920, 1080)}>
            1920x1080
          </button>
          <button onClick={() => handleSizeChange(1080, 1080)}>
            1080x1080
          </button>
          <button onClick={() => handleSizeChange(1080, 2400)}>
            1080x2400
          </button>
        </div>
      )}
    </div>
  );
}
