import React, { useCallback, useEffect, useRef, useState } from "react";
import { IconContext } from "react-icons";
import { MdArrowBackIosNew } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import "./Create.css";
import Sidebar from "./Sidebar";

export default function Create() {
  const location = useLocation();
  const { image } = location.state || {};
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
  const [albumSize, setAlbumSize] = useState(100);
  const [useGradient, setUseGradient] = useState(false);
  const [gradientAngle, setGradientAngle] = useState(45);
  const [dominantColors, setDominantColors] = useState([]);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  let navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  const extractDominantColors = useCallback((img) => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    const colorCounts = {};
    for (let i = 0; i < imageData.length; i += 4) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      const color = `rgb(${r},${g},${b})`;
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    }

    const sortedColors = Object.entries(colorCounts).sort(
      (a, b) => b[1] - a[1]
    );

    // Filter out very light and very dark colors
    const filteredColors = sortedColors.filter(([color]) => {
      const [r, g, b] = color.match(/\d+/g).map(Number);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 20 && brightness < 230;
    });

    return filteredColors.slice(0, 3).map(([color]) => color);
  }, []);

  const drawGradient = useCallback(() => {
    if (canvasRef.current && dominantColors.length) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createLinearGradient(
        0,
        0,
        Math.cos((gradientAngle * Math.PI) / 180) * canvas.width,
        Math.sin((gradientAngle * Math.PI) / 180) * canvas.height
      );
      dominantColors.forEach((color, index) => {
        gradient.addColorStop(index / (dominantColors.length - 1), color);
      });
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [dominantColors, gradientAngle]);

  const drawImage = useCallback(() => {
    if (canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = imageRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (useGradient) {
        drawGradient();
      } else {
        // Fill with a neutral color when not using gradient
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const scaleFactor = albumSize / 100;
      const newWidth = img.width * scaleFactor;
      const newHeight = img.height * scaleFactor;
      const x = (canvas.width - newWidth) / 2;
      const y = (canvas.height - newHeight) / 2;
      ctx.drawImage(img, x, y, newWidth, newHeight);
    }
  }, [albumSize, useGradient, drawGradient]);

  useEffect(() => {
    if (image) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageRef.current = img;
        const colors = extractDominantColors(img);
        setDominantColors(colors);
        drawImage();
      };
      img.src = image;
    }
  }, [image, drawImage, extractDominantColors]);

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

  const handleSizeChange = (newSize) => {
    setCanvasSize(newSize);
  };

  const handleAlbumSizeChange = (newSize) => {
    setAlbumSize(newSize);
  };

  const handleGradientToggle = (newValue) => {
    setUseGradient(newValue);
  };

  const handleGradientAngleChange = (newAngle) => {
    setGradientAngle(newAngle);
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
          onGradientToggle={handleGradientToggle}
          onGradientAngleChange={handleGradientAngleChange}
          useGradient={useGradient}
          gradientAngle={gradientAngle}
        />
      </div>
    </div>
  );
}
