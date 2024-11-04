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
  const [customGradient, setCustomGradient] = useState({
    color1: "#ffffff",
    color2: "#000000",
    color3: "#808080",
    color4: "#404040",
    angle: 45,
    isCustom: false,
  });

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
          // Apply custom gradient
          const gradient = createCustomGradient(
            ctx,
            canvas,
            customGradient,
            customGradient.angle
          );
          ctx.fillStyle = gradient;
        } else {
          // Apply auto gradient based on dominant colors
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
      const x = (canvas.width - newWidth) / 2;
      const y = (canvas.height - newHeight) / 2;
      ctx.drawImage(img, x, y, newWidth, newHeight);

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
