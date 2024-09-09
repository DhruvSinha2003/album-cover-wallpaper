import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Create() {
  const location = useLocation();
  const { image } = location.state || {};
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (image) {
      const img = new Image();
      img.onload = () => {
        const x = (canvas.width - img.width) / 2;
        const y = (canvas.height - img.height) / 2;
        ctx.drawImage(img, x, y);
      };
      img.src = image;
    }
  }, [image, canvasSize]);

  const handleSizeChange = (newSize) => {
    setCanvasSize(newSize);
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1 }}>
        <h1>Create Wallpaper</h1>
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{
            border: "1px solid black",
            maxWidth: "100%",
            height: "auto",
          }}
        />
      </div>
      <Sidebar onSizeChange={handleSizeChange} />
    </div>
  );
}
