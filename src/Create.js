import React, { useCallback, useEffect, useRef, useState } from "react";
import { IconContext } from "react-icons";
import { MdArrowBackIosNew } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import "./Create.css";
import Sidebar from "./Sidebar";
import { createGradient, extractDistinctColors } from "./gradientUtils";

export default function Create() {
  const [solidColor, setSolidColor] = useState("#f0f0f0");
  const location = useLocation();
  const { image } = location.state || {};
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
  const [albumSize, setAlbumSize] = useState(100);
  const [useGradient, setUseGradient] = useState(false);
  const [gradientAngle, setGradientAngle] = useState(45);
  const [dominantColors, setDominantColors] = useState([]);
  const [dropShadow, setDropShadow] = useState({ intensity: 0 });
  const [customGradient, setCustomGradient] = useState({
    color1: "#ffffff",
    color2: "#000000",
    angle: 45,
  });

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

      if (useGradient) {
        const gradient = createGradient(
          ctx,
          canvas.width,
          canvas.height,
          dominantColors,
          gradientAngle
        );
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = solidColor;
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply drop shadow if intensity > 0
      if (dropShadow.intensity > 0) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = dropShadow.intensity * 0.5;
        ctx.shadowOffsetX = dropShadow.intensity * 0.2;
        ctx.shadowOffsetY = dropShadow.intensity * 0.2;
      }

      const scaleFactor = albumSize / 100;
      const newWidth = img.width * scaleFactor;
      const newHeight = img.height * scaleFactor;
      const x = (canvas.width - newWidth) / 2;
      const y = (canvas.height - newHeight) / 2;
      ctx.drawImage(img, x, y, newWidth, newHeight);

      // Reset shadow effects
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
  }, [
    albumSize,
    useGradient,
    gradientAngle,
    dominantColors,
    solidColor,
    dropShadow,
  ]);

  useEffect(() => {
    if (image) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageRef.current = img;
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        ).data;
        const colors = extractDistinctColors(imageData);
        setDominantColors(colors);
        drawImage();
      };
      img.src = image;
    }
  }, [image, drawImage]);

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
    drawImage();
    adjustCanvasSize();
  }, [
    canvasSize,
    albumSize,
    useGradient,
    gradientAngle,
    drawImage,
    adjustCanvasSize,
  ]);

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
          onSizeChange={setCanvasSize}
          onAlbumSizeChange={setAlbumSize}
          albumSize={albumSize}
          onDownload={handleDownload}
          onGradientToggle={setUseGradient}
          onGradientAngleChange={setGradientAngle}
          useGradient={useGradient}
          gradientAngle={gradientAngle}
          solidColor={solidColor}
          onSolidColorChange={setSolidColor}
          dropShadow={dropShadow}
          onDropShadowChange={setDropShadow}
          customGradient={customGradient}
          onCustomGradientChange={setCustomGradient}
        />
      </div>
    </div>
  );
}
