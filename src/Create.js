import React, { useCallback, useEffect, useRef, useState } from "react";
import { IconContext } from "react-icons";
import { MdArrowBackIosNew } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import "./Create.css";
import Sidebar from "./Sidebar";
import { createGradient, extractDistinctColors } from "./utils/gradientUtils";

export default function Create() {
  const [solidColor, setSolidColor] = useState("#f0f0f0");
  const SNAP_THRESHOLD = 30;
  const location = useLocation();
  const { image } = location.state || {};
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
  const [albumSize, setAlbumSize] = useState(100);
  const [useGradient, setUseGradient] = useState(false);
  const [gradientAngle, setGradientAngle] = useState(45);
  const [dominantColors, setDominantColors] = useState([]);
  const [isColorPickerActive, setIsColorPickerActive] = useState(false);
  const [colorPickerCallback, setColorPickerCallback] = useState(null);
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
    ctx.strokeStyle = "rgba(0, 255, 0, 0.8)"; // Bright green for visibility
    ctx.setLineDash([10, 5]);
    ctx.lineWidth = 3; // Thicker lines
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 5;

    const centerX = width / 2;
    const centerY = height / 2;

    // Vertical and horizontal center lines
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Rule of thirds guides
    [0.25, 0.75].forEach((percent) => {
      const x = width * percent;
      const y = height * percent;

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

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

  const handleCanvasColorPick = useCallback(
    (e) => {
      if (!isColorPickerActive || !canvasRef.current || !imageRef.current)
        return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);

      const ctx = canvas.getContext("2d");
      const pixel = ctx.getImageData(x, y, 1, 1);
      const color = `rgb(${pixel.data[0]},${pixel.data[1]},${pixel.data[2]})`;

      // Convert RGB to Hex
      const rgbToHex = (r, g, b) =>
        "#" +
        [r, g, b]
          .map((x) => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
          })
          .join("");

      const hexColor = rgbToHex(pixel.data[0], pixel.data[1], pixel.data[2]);

      if (colorPickerCallback) {
        colorPickerCallback(hexColor);
        setIsColorPickerActive(false);
        setColorPickerCallback(null);
      }
    },
    [isColorPickerActive, colorPickerCallback]
  );

  // Modify existing event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (isColorPickerActive && canvas) {
      canvas.style.cursor = "crosshair";
      canvas.addEventListener("click", handleCanvasColorPick);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("click", handleCanvasColorPick);
        canvas.style.cursor = "default";
      }
    };
  }, [isColorPickerActive, handleCanvasColorPick]);

  const activateCanvasColorPicker = (callback) => {
    setIsColorPickerActive(true);
    setColorPickerCallback(() => callback);
  };

  const drawCenterMarker = (ctx, x, y, size = 20) => {
    if (showGuides) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 0, 0, 0.8)"; // Red color
      ctx.lineWidth = 3;

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(x - size / 2, y);
      ctx.lineTo(x + size / 2, y);
      ctx.stroke();

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(x, y - size / 2);
      ctx.lineTo(x, y + size / 2);
      ctx.stroke();

      ctx.restore();
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

      const newImageX = dragState.imageX + deltaX;
      const newImageY = dragState.imageY + deltaY;

      const scaleFactor = albumSize / 100;
      const imgWidth = imageRef.current.width * scaleFactor;
      const imgHeight = imageRef.current.height * scaleFactor;
      const imgCenterX =
        (canvas.width - imgWidth) / 2 + newImageX + imgWidth / 2;
      const imgCenterY =
        (canvas.height - imgHeight) / 2 + newImageY + imgHeight / 2;
      const canvasCenterX = canvas.width / 2;
      const canvasCenterY = canvas.height / 2;

      let finalImageX = newImageX;
      let finalImageY = newImageY;
      if (Math.abs(imgCenterX - canvasCenterX) < SNAP_THRESHOLD) {
        finalImageX =
          canvasCenterX - (canvas.width - imgWidth) / 2 - imgWidth / 2;
      }
      if (Math.abs(imgCenterY - canvasCenterY) < SNAP_THRESHOLD) {
        finalImageY =
          canvasCenterY - (canvas.height - imgHeight) / 2 - imgHeight / 2;
      }

      setDragState((prev) => ({
        ...prev,
        imageX: finalImageX,
        imageY: finalImageY,
        startX: x,
        startY: y,
      }));

      drawImage();
    }
  };

  const handleMouseUp = () => {
    setDragState((prev) => ({ ...prev, isDragging: false }));
    setShowGuides(false);
    drawImage();
  };

  const drawImage = useCallback(() => {
    if (canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = imageRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

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

      if (showGuides) {
        drawGuideLines(ctx, canvas.width, canvas.height);
      }

      // Apply shadow effect
      if (dropShadow.config) {
        applyShadowEffect(ctx, dropShadow.config);
      }

      // Draw image
      const scaleFactor = albumSize / 100;
      const newWidth = img.width * scaleFactor;
      const newHeight = img.height * scaleFactor;
      const x = (canvas.width - newWidth) / 2 + dragState.imageX;
      const y = (canvas.height - newHeight) / 2 + dragState.imageY;

      ctx.drawImage(img, x, y, newWidth, newHeight);

      // Draw center marker for the image
      const imgCenterX = x + newWidth / 2;
      const imgCenterY = y + newHeight / 2;
      drawCenterMarker(ctx, imgCenterX, imgCenterY);

      // Reset shadow
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    }
  }, [
    albumSize,
    useGradient,
    gradientAngle,
    dominantColors,
    drawCenterMarker,
    showGuides,
    solidColor,
    dropShadow,
    customGradient,
    dragState,
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
          onActivateCanvasColorPicker={activateCanvasColorPicker}
          isColorPickerActive={isColorPickerActive}
        />
      </div>
    </div>
  );
}
