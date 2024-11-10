import React, { useCallback, useEffect, useRef, useState } from "react";
import { IconContext } from "react-icons";
import { MdArrowBackIosNew } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import "./Create.css";
import Sidebar from "./Sidebar";
import { createGradient, extractDistinctColors } from "./utils/gradientUtils";

export default function Create() {
  const [solidColor, setSolidColor] = useState("#f0f0f0");
  const location = useLocation();
  const { image } = location.state || {};
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
  const [albumSize, setAlbumSize] = useState(100);
  const [useGradient, setUseGradient] = useState(false);
  const [gradientAngle, setGradientAngle] = useState(45);
  const [dominantColors, setDominantColors] = useState([]);
  const [customGradient, setCustomGradient] = useState({
    color1: "#FF5733",
    color2: "#33FF57",
    color3: "#3357FF",
    color4: "#F033FF",
    angle: 45,
    isCustom: false,
  });
  const [dropShadow, setDropShadow] = useState({
    intensity: 0,
    config: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      blur: 20,
      mode: "uniform",
    },
  });

  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    startY: 0,
    imageX: 0,
    imageY: 0,
  });

  const [showGuides, setShowGuides] = useState(false);

  const drawGuideLines = (ctx, width, height) => {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    // Vertical guides
    [0.25, 0.5, 0.75].forEach((percent) => {
      const x = width * percent;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    });

    // Horizontal guides
    [0.25, 0.5, 0.75].forEach((percent) => {
      const y = height * percent;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    });

    ctx.restore();
  };

  const handleMouseDown = (e) => {
    if (canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);

      // Check if click is within image bounds
      const scaleFactor = albumSize / 100;
      const imgWidth = imageRef.current.width * scaleFactor;
      const imgHeight = imageRef.current.height * scaleFactor;
      const imgX = (canvas.width - imgWidth) / 2 + dragState.imageX;
      const imgY = (canvas.height - imgHeight) / 2 + dragState.imageY;

      if (
        x >= imgX &&
        x <= imgX + imgWidth &&
        y >= imgY &&
        y <= imgY + imgHeight
      ) {
        setDragState({
          isDragging: true,
          startX: x,
          startY: y,
          imageX: dragState.imageX,
          imageY: dragState.imageY,
        });
        setShowGuides(true);
      }
    }
  };

  const handleMouseMove = (e) => {
    if (dragState.isDragging && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);

      const deltaX = x - dragState.startX;
      const deltaY = y - dragState.startY;

      setDragState((prev) => ({
        ...prev,
        imageX: prev.imageX + deltaX,
        imageY: prev.imageY + deltaY,
        startX: x,
        startY: y,
      }));

      drawImage();
    }
  };

  const handleMouseUp = () => {
    setDragState((prev) => ({ ...prev, isDragging: false }));
    setShowGuides(false);
  };

  const drawImage = useCallback(() => {
    if (canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = imageRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Reset shadow effects
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      if (useGradient) {
        if (customGradient.isCustom) {
          const gradient = ctx.createLinearGradient(
            0,
            0,
            Math.cos((customGradient.angle * Math.PI) / 180) * canvas.width,
            Math.sin((customGradient.angle * Math.PI) / 180) * canvas.height
          );

          gradient.addColorStop(0, customGradient.color1);
          gradient.addColorStop(0.33, customGradient.color2);
          gradient.addColorStop(0.66, customGradient.color3);
          gradient.addColorStop(1, customGradient.color4);

          ctx.fillStyle = gradient;
        } else {
          const gradient = createGradient(
            ctx,
            canvas.width,
            canvas.height,
            dominantColors,
            gradientAngle
          );
          ctx.fillStyle = gradient;
        }
      } else {
        ctx.fillStyle = solidColor;
      }

      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply shadow effect before drawing the image
      if (dropShadow.config) {
        applyShadowEffect(ctx, dropShadow.config);
      }

      const scaleFactor = albumSize / 100;
      const newWidth = img.width * scaleFactor;
      const newHeight = img.height * scaleFactor;
      const x = (canvas.width - newWidth) / 2 + dragState.imageX;
      const y = (canvas.height - newHeight) / 2 + dragState.imageY;

      ctx.drawImage(img, x, y, newWidth, newHeight);

      // Draw guides if dragging
      if (showGuides) {
        drawGuideLines(ctx, canvas.width, canvas.height);
      }

      // Reset shadow effects after drawing
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
    customGradient,
    dragState,
    showGuides,
  ]);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  let navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  const applyShadowEffect = (ctx, shadowConfig) => {
    const { mode, top, right, bottom, left, blur, intensity } = shadowConfig;

    if (mode === "uniform" && intensity > 0) {
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = intensity * 0.5;
      ctx.shadowOffsetX = intensity * 0.2;
      ctx.shadowOffsetY = intensity * 0.2;
    } else if (mode === "custom" || mode === "directional") {
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = blur;

      if (top > 0) ctx.shadowOffsetY = -top * 0.2;
      if (bottom > 0) ctx.shadowOffsetY = bottom * 0.2;
      if (left > 0) ctx.shadowOffsetX = -left * 0.2;
      if (right > 0) ctx.shadowOffsetX = right * 0.2;
    }
  };

  const createCustomGradient = (ctx, canvas, colors, angle) => {
    const gradient = ctx.createLinearGradient(
      0,
      0,
      Math.cos((angle * Math.PI) / 180) * canvas.width,
      Math.sin((angle * Math.PI) / 180) * canvas.height
    );

    gradient.addColorStop(0, colors.color1);
    gradient.addColorStop(0.33, colors.color2);
    gradient.addColorStop(0.66, colors.color3);
    gradient.addColorStop(1, colors.color4);

    return gradient;
  };

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
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
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
