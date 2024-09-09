import React, { useState } from "react";

export default function Sidebar() {
  const [sidebarToggle, setSidebarToggle] = useState(0);
  return (
    <div>
      {sidebarToggle ? (
        <button onClick={() => setSidebarToggle(0)}>Sidebar</button>
      ) : (
        <button onClick={() => setSidebarToggle(1)}>Close</button>
      )}
    </div>
  );
}
