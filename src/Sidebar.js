import CropSquareIcon from "@mui/icons-material/CropSquare";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import { Slider, Stack } from "@mui/material";
import debounce from "lodash/debounce";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { HexColorPicker } from "react-colorful";
import "./Sidebar.css";

export default function Sidebar({
  onSizeChange,
  onAlbumSizeChange,
  albumSize,
  onDownload,
  useGradient,
  onGradientToggle,
  gradientAngle,
  onGradientAngleChange,
  solidColor,
  onSolidColorChange,
  dropShadow,
  onDropShadowChange,
  customGradient,
  onCustomGradientChange,
}) {
  const [localAlbumSize, setLocalAlbumSize] = useState(albumSize);
  const [localGradientAngle, setLocalGradientAngle] = useState(gradientAngle);
  const [backgroundType, setBackgroundType] = useState("solid");

  const handleSizeChange = (width, height) => {
    onSizeChange({ width, height });
  };

  // Create memoized debounced functions
  const debouncedAlbumSize = useMemo(
    () => debounce((value) => onAlbumSizeChange(value), 100),
    [onAlbumSizeChange]
  );

  const debouncedGradientAngle = useMemo(
    () => debounce((value) => onGradientAngleChange(value), 100),
    [onGradientAngleChange]
  );

  // Cleanup debounced functions on unmount
  useEffect(() => {
    return () => {
      debouncedAlbumSize.cancel();
      debouncedGradientAngle.cancel();
    };
  }, [debouncedAlbumSize, debouncedGradientAngle]);

  const handleSliderChange = useCallback(
    (event, newValue) => {
      setLocalAlbumSize(newValue);
      debouncedAlbumSize(newValue);
    },
    [debouncedAlbumSize]
  );

  const handleGradientAngleChange = useCallback(
    (event, newValue) => {
      setLocalGradientAngle(newValue);
      debouncedGradientAngle(newValue);
    },
    [debouncedGradientAngle]
  );

  const handleBackgroundTypeChange = (type) => {
    setBackgroundType(type);
    onGradientToggle(type === "gradient");
  };

  return (
    <div className="sidebar">
      <section className="sidebar-section">
        <h3>Canvas Size</h3>
        <div className="canvas-size-buttons">
          <button
            className="canvas-size-button"
            onClick={() => handleSizeChange(1920, 1080)}
          >
            <DesktopWindowsIcon fontSize="large" />
            <span>1920x1080</span>
          </button>
          <button
            className="canvas-size-button"
            onClick={() => handleSizeChange(1080, 1080)}
          >
            <CropSquareIcon fontSize="large" />
            <span>1080x1080</span>
          </button>
          <button
            className="canvas-size-button"
            onClick={() => handleSizeChange(1080, 2400)}
          >
            <SmartphoneIcon fontSize="large" />
            <span>1080x2400</span>
          </button>
        </div>
      </section>

      <section className="sidebar-section">
        <h3>Album Size</h3>
        <Stack spacing={2} direction="row" sx={{ alignItems: "center", mb: 1 }}>
          <Slider
            aria-label="AlbumSize"
            value={localAlbumSize}
            onChange={handleSliderChange}
            min={50}
            max={170}
          />
        </Stack>
      </section>

      <section className="sidebar-section">
        <h3>Background</h3>
        <div className="background-type-buttons">
          <button
            className={`type-button ${
              backgroundType === "solid" ? "active" : ""
            }`}
            onClick={() => handleBackgroundTypeChange("solid")}
          >
            Solid Color
          </button>
          <button
            className={`type-button ${
              backgroundType === "gradient" ? "active" : ""
            }`}
            onClick={() => handleBackgroundTypeChange("gradient")}
          >
            Auto Gradient
          </button>
          <button
            className={`type-button ${
              backgroundType === "customGradient" ? "active" : ""
            }`}
            onClick={() => handleBackgroundTypeChange("customGradient")}
          >
            Custom Gradient
          </button>
        </div>

        {backgroundType === "solid" && (
          <div className="color-picker-container">
            <HexColorPicker
              color={solidColor}
              onChange={onSolidColorChange}
              className="color-picker"
            />
          </div>
        )}

        {backgroundType === "gradient" && (
          <div className="gradient-controls">
            <Stack
              spacing={2}
              direction="row"
              sx={{ alignItems: "center", mt: 1 }}
            >
              <p>Angle</p>
              <Slider
                aria-label="GradientAngle"
                value={localGradientAngle}
                onChange={handleGradientAngleChange}
                min={0}
                max={360}
              />
            </Stack>
          </div>
        )}

        {backgroundType === "customGradient" && (
          <div className="custom-gradient-controls">
            <div className="gradient-colors">
              <HexColorPicker
                color={customGradient.color1}
                onChange={(color) =>
                  onCustomGradientChange({ ...customGradient, color1: color })
                }
              />
              <HexColorPicker
                color={customGradient.color2}
                onChange={(color) =>
                  onCustomGradientChange({ ...customGradient, color2: color })
                }
              />
            </div>
            <Stack
              spacing={2}
              direction="row"
              sx={{ alignItems: "center", mt: 1 }}
            >
              <p>Angle</p>
              <Slider
                value={customGradient.angle}
                onChange={(_, value) =>
                  onCustomGradientChange({ ...customGradient, angle: value })
                }
                min={0}
                max={360}
              />
            </Stack>
          </div>
        )}
      </section>

      <section className="sidebar-section">
        <h3>Effects</h3>
        <div className="effects-controls">
          <Stack spacing={2} direction="row" sx={{ alignItems: "center" }}>
            <p>Drop Shadow</p>
            <Slider
              value={dropShadow.intensity}
              onChange={(_, value) =>
                onDropShadowChange({ ...dropShadow, intensity: value })
              }
              min={0}
              max={100}
            />
          </Stack>
        </div>
      </section>

      <button onClick={onDownload} className="download-button">
        Download Wallpaper
      </button>
    </div>
  );
}
