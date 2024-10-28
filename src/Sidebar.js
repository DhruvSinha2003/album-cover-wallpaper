import CropSquareIcon from "@mui/icons-material/CropSquare";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import { Popover, Slider, Stack } from "@mui/material";
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
  const [backgroundType, setBackgroundType] = useState("solid");
  const [colorPickerAnchor, setColorPickerAnchor] = useState(null);
  const [activeColorPicker, setActiveColorPicker] = useState(null);
  const [customColors, setCustomColors] = useState({
    color1: "#FF5733",
    color2: "#33FF57",
    color3: "#3357FF",
    color4: "#F033FF",
  });
  const [shadowConfig, setShadowConfig] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    blur: 20,
    intensity: dropShadow.intensity,
    mode: "uniform",
  });

  const handleSizeChange = useCallback(
    (width, height) => {
      onSizeChange({ width, height });
    },
    [onSizeChange]
  );

  // Handle color picker click
  const handleColorPickerClick = (event, colorKey) => {
    setColorPickerAnchor(event.currentTarget);
    setActiveColorPicker(colorKey);
  };

  // Handle color picker close
  const handleColorPickerClose = () => {
    setColorPickerAnchor(null);
    setActiveColorPicker(null);
  };

  // Update shadow configuration
  const handleShadowConfigChange = (config) => {
    setShadowConfig(config);
    // Convert shadow config to the format expected by the main component
    const shadowIntensity =
      config.mode === "uniform"
        ? config.intensity
        : Math.max(config.top, config.right, config.bottom, config.left);
    onDropShadowChange({
      intensity: shadowIntensity,
      config: config,
    });
  };

  // Create fancy gradient effect
  const createFancyGradient = (colors) => {
    return `conic-gradient(
      from ${customGradient.angle}deg,
      ${colors.color1} 0deg,
      ${colors.color2} 90deg,
      ${colors.color3} 180deg,
      ${colors.color4} 270deg,
      ${colors.color1} 360deg
    )`;
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

  return (
    <div className="sidebar">
      {/* Canvas Size Section */}
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

      {/* Album Size Section */}
      <section className="sidebar-section">
        <h3>Album Size</h3>
        <Stack spacing={2} direction="row" sx={{ alignItems: "center" }}>
          <span>Size</span>
          <Slider
            value={albumSize}
            onChange={(_, value) => debouncedAlbumSize(value)}
            min={10}
            max={200}
          />
        </Stack>
      </section>

      {/* Background Section */}
      <section className="sidebar-section">
        <h3>Background</h3>
        <div className="background-type-buttons">
          {["solid", "gradient", "customGradient"].map((type) => (
            <button
              key={type}
              className={`type-button ${
                backgroundType === type ? "active" : ""
              }`}
              onClick={(e) => {
                setBackgroundType(type);
                onGradientToggle(type !== "solid");
                if (type === "solid") {
                  handleColorPickerClick(e, "solid");
                }
              }}
            >
              <div className="button-content">
                <div
                  className="button-preview"
                  style={{
                    background:
                      type === "customGradient"
                        ? createFancyGradient(customColors)
                        : type === "gradient"
                        ? `linear-gradient(${gradientAngle}deg, #FF5733, #33FF57)`
                        : solidColor,
                  }}
                />
                <span>
                  {type === "customGradient"
                    ? "Fancy Gradient"
                    : type === "gradient"
                    ? "Auto Gradient"
                    : "Solid Color"}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Color Pickers */}
        <Popover
          open={Boolean(colorPickerAnchor)}
          anchorEl={colorPickerAnchor}
          onClose={handleColorPickerClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          <div className="color-picker-popup">
            {activeColorPicker === "solid" ? (
              <HexColorPicker
                color={solidColor}
                onChange={onSolidColorChange}
              />
            ) : activeColorPicker?.startsWith("color") ? (
              <HexColorPicker
                color={customColors[activeColorPicker]}
                onChange={(color) => {
                  setCustomColors((prev) => ({
                    ...prev,
                    [activeColorPicker]: color,
                  }));
                }}
              />
            ) : null}
          </div>
        </Popover>

        {/* Custom Gradient Controls */}
        {backgroundType === "customGradient" && (
          <div className="custom-gradient-controls">
            <div className="gradient-colors">
              {Object.entries(customColors).map(([key, color]) => (
                <button
                  key={key}
                  className="color-preview"
                  onClick={(e) => handleColorPickerClick(e, key)}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <Stack
              spacing={2}
              direction="row"
              sx={{ alignItems: "center", mt: 1 }}
            >
              <span>Angle</span>
              <Slider
                value={gradientAngle}
                onChange={(_, value) => debouncedGradientAngle(value)}
                min={0}
                max={360}
              />
            </Stack>
          </div>
        )}
      </section>

      {/* Shadow Effects Section */}
      <section className="sidebar-section">
        <h3>Shadow Effects</h3>
        <div className="shadow-controls">
          <div className="shadow-mode-buttons">
            {["uniform", "custom", "directional"].map((mode) => (
              <button
                key={mode}
                className={`mode-button ${
                  shadowConfig.mode === mode ? "active" : ""
                }`}
                onClick={() => setShadowConfig((prev) => ({ ...prev, mode }))}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {shadowConfig.mode === "uniform" && (
            <Stack
              spacing={2}
              direction="row"
              sx={{ alignItems: "center", mt: 2 }}
            >
              <span>Intensity</span>
              <Slider
                value={shadowConfig.intensity}
                onChange={(_, value) =>
                  handleShadowConfigChange({
                    ...shadowConfig,
                    intensity: value,
                    top: value,
                    right: value,
                    bottom: value,
                    left: value,
                  })
                }
                min={0}
                max={100}
              />
            </Stack>
          )}

          {shadowConfig.mode === "custom" && (
            <div className="custom-shadow-controls">
              {["top", "right", "bottom", "left"].map((direction) => (
                <div key={direction} className="shadow-slider">
                  <span>{direction}</span>
                  <Slider
                    value={shadowConfig[direction]}
                    onChange={(_, value) =>
                      handleShadowConfigChange({
                        ...shadowConfig,
                        [direction]: value,
                      })
                    }
                    min={0}
                    max={100}
                  />
                </div>
              ))}
              <div className="shadow-slider">
                <span>Blur</span>
                <Slider
                  value={shadowConfig.blur}
                  onChange={(_, value) =>
                    handleShadowConfigChange({
                      ...shadowConfig,
                      blur: value,
                    })
                  }
                  min={0}
                  max={100}
                />
              </div>
            </div>
          )}

          {shadowConfig.mode === "directional" && (
            <div className="directional-shadow-control">
              <div className="shadow-direction-pad">
                {["top", "right", "bottom", "left"].map((direction) => (
                  <button
                    key={direction}
                    className={`direction-button ${
                      shadowConfig[direction] > 0 ? "active" : ""
                    }`}
                    onClick={() =>
                      handleShadowConfigChange({
                        ...shadowConfig,
                        [direction]: shadowConfig[direction] > 0 ? 0 : 50,
                      })
                    }
                  >
                    {direction}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <button onClick={onDownload} className="download-button">
        Download Wallpaper
      </button>
    </div>
  );
}
