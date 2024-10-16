import React, { useCallback, useEffect, useRef, useState } from "react";
import { IconContext } from "react-icons";
import { MdArrowBackIosNew } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./Create.css"

export default function Create() {
  const location = useLocation();
  const { image } = location.state || {};
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
  const [albumSize, setAlbumSize] = useState(100);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  let navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  const drawImage = useCallback(() => {
    if (canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = imageRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scaleFactor = albumSize / 100;
      const newWidth = img.width * scaleFactor;
      const newHeight = img.height * scaleFactor;
      const x = (canvas.width - newWidth) / 2;
      const y = (canvas.height - newHeight) / 2;
      ctx.drawImage(img, x, y, newWidth, newHeight);
    }
  }, [albumSize]);

  const adjustCanvasSize = useCallback(() => {
    if (containerRef.current && canvasRef.current) {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const canvasAspectRatio = canvasSize.width / canvasSize.height;
      const containerAspectRatio = containerWidth / containerHeight;

      let newWidth, newHeight;

      if (canvasAspectRatio > containerAspectRatio) {
        newWidth = containerWidth;
        newHeight = containerWidth / canvasAspectRatio;
      } else {
        newHeight = containerHeight;
        newWidth = containerHeight * canvasAspectRatio;
      }

      canvas.style.width = `${newWidth}px`;
      canvas.style.height = `${newHeight}px`;
    }
  }, [canvasSize.width, canvasSize.height]);

  useEffect(() => {
    if (image) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageRef.current = img;
        drawImage();
      };
      img.src = image;
    }
  }, [image, drawImage]);

  useEffect(() => {
    drawImage();
    adjustCanvasSize();
  }, [canvasSize, albumSize, drawImage, adjustCanvasSize]);

  useEffect(() => {
    window.addEventListener("resize", adjustCanvasSize);
    return () => window.removeEventListener("resize", adjustCanvasSize);
  }, [adjustCanvasSize]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "album-wallpaper.png";
      link.href = image;
      link.click();
    }
  };

  const handleSizeChange = (newSize) => {
    setCanvasSize(newSize);
  };

  const handleAlbumSizeChange = (newSize) => {
    setAlbumSize(newSize);
  };

  return (
    <div className="create-container">
      <div className="main-content">
        <div className="top-bar">
          <IconContext.Provider value={{ size: "1.3em" }}>
            <div className="back-button" onClick={handleBack}>
              <MdArrowBackIosNew />
            </div>
          </IconContext.Provider>
          <h1>Create Wallpaper</h1>
        </div>
        <div className="canvas-container" ref={containerRef}>
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
          />
        </div>
      </div>
      <div className="sidebar-wrapper">
        <Sidebar
          onSizeChange={handleSizeChange}
          onAlbumSizeChange={handleAlbumSizeChange}
          albumSize={albumSize}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
}
