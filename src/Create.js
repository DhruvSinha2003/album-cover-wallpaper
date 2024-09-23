import React, { useEffect, useRef, useState } from "react";
import { IconContext } from "react-icons";
import { MdArrowBackIosNew } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Create() {
  const location = useLocation();
  const { image } = location.state || {};
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
  const [albumSize, setAlbumSize] = useState(100);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  let navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  useEffect(() => {
    if (image) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        drawImage();
      };
      img.src = image;
    }
  }, [image]);

  const drawImage = () => {
    if (canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = imageRef.current;

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scaleFactor = albumSize / 100;
      const newWidth = img.width * scaleFactor;
      const newHeight = img.height * scaleFactor;
      const x = (canvas.width - newWidth) / 2;
      const y = (canvas.height - newHeight) / 2;
      ctx.drawImage(img, x, y, newWidth, newHeight);
    }
  };

  useEffect(() => {
    drawImage();
  }, [canvasSize, albumSize]);

  const handleSizeChange = (newSize) => {
    setCanvasSize(newSize);
  };

  const handleAlbumSizeChange = (newSize) => {
    setAlbumSize(newSize);
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1 }}>
        <div className="top-bar">
          <IconContext.Provider value={{ size: "1.3em" }}>
            <div className="back-button" onClick={handleBack}>
              <MdArrowBackIosNew />
            </div>
          </IconContext.Provider>
          <h1>Create Wallpaper</h1>
        </div>
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
      <Sidebar
        onSizeChange={handleSizeChange}
        onAlbumSizeChange={handleAlbumSizeChange}
        albumSize={albumSize}
      />
    </div>
  );
}
