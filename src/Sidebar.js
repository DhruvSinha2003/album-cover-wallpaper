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
  onActivateCanvasColorPicker,
  isColorPickerActive,
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

  const handleColorPickerClick = (event, colorKey) => {
    setColorPickerAnchor(event.currentTarget);
    setActiveColorPicker(colorKey);
  };

  const handleColorPickerWithCanvasOption = (event, colorKey) => {
    handleColorPickerClick(event, colorKey);
    setColorPickerWithCanvasOption(true);
  };

  const [colorPickerWithCanvasOption, setColorPickerWithCanvasOption] =
    useState(false);
  const handleCanvasColorPick = () => {
    handleColorPickerClose();

    onActivateCanvasColorPicker((color) => {
      if (activeColorPicker === "solid") {
        onSolidColorChange(color);
      } else if (activeColorPicker?.startsWith("color")) {
        setCustomColors((prev) => ({
          ...prev,
          [activeColorPicker]: color,
        }));
      }
      setColorPickerWithCanvasOption(false);
    });
  };

  const debouncedAlbumSize = useMemo(
    () => debounce((value) => onAlbumSizeChange(value), 100),
    [onAlbumSizeChange]
  );

  const debouncedGradientAngle = useMemo(
    () => debounce((value) => onGradientAngleChange(value), 100),
    [onGradientAngleChange]
  );

  const handleGradientAngleChange = useCallback(
    (newAngle) => {
      debouncedGradientAngle(newAngle);
      onCustomGradientChange({
        ...customGradient,
        angle: newAngle,
        isCustom: true,
      });
    },
    [customGradient, debouncedGradientAngle, onCustomGradientChange]
  );

  const handleSizeChange = useCallback(
    (width, height) => {
      onSizeChange({ width, height });
    },
    [onSizeChange]
  );

  const handleColorPickerClose = () => {
    setColorPickerAnchor(null);
    setActiveColorPicker(null);
  };

  // Update shadow configuration
  const handleShadowConfigChange = (config) => {
    setShadowConfig(config);
    const shadowIntensity =
      config.mode === "uniform"
        ? config.intensity
        : Math.max(config.top, config.right, config.bottom, config.left);
    onDropShadowChange({
      intensity: shadowIntensity,
      config: config,
    });
  };

  // Cleanup debounced functions on unmount
  useEffect(() => {
    return () => {
      debouncedAlbumSize.cancel();
      debouncedGradientAngle.cancel();
    };
  }, [debouncedAlbumSize, debouncedGradientAngle]);

  // Update custom gradient when colors change
  useEffect(() => {
    if (backgroundType === "customGradient") {
      onCustomGradientChange({
        ...customGradient,
        ...customColors,
        isCustom: true,
      });
    }
  }, [customColors, backgroundType, customGradient, onCustomGradientChange]);

  // Get current gradient angle based on background type
  const currentGradientAngle =
    backgroundType === "customGradient" ? customGradient.angle : gradientAngle;

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
              onClick={() => {
                setBackgroundType(type);
                onGradientToggle(type !== "solid");
                if (type === "customGradient") {
                  onCustomGradientChange({
                    ...customGradient,
                    ...customColors,
                    isCustom: true,
                  });
                } else if (type === "gradient") {
                  onCustomGradientChange({
                    ...customGradient,
                    isCustom: false,
                  });
                }
                if (type === "solid") {
                  setActiveColorPicker("solid");
                  setColorPickerAnchor(
                    document.querySelector(".type-button.active")
                  );
                } else {
                  setActiveColorPicker(null);
                  setColorPickerAnchor(null);
                }
              }}
            >
              <div className="button-content">
                <div
                  className="button-preview"
                  style={{
                    background:
                      type === "customGradient"
                        ? `linear-gradient(${customGradient.angle}deg, ${customColors.color1}, ${customColors.color2}, ${customColors.color3}, ${customColors.color4})`
                        : type === "gradient"
                        ? `linear-gradient(${gradientAngle}deg, #FF5733, #33FF57)`
                        : solidColor,
                  }}
                />
                <span>
                  {type === "customGradient"
                    ? "Custom Gradient"
                    : type === "gradient"
                    ? "Auto"
                    : "Solid Color"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

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
            <>
              <HexColorPicker
                color={solidColor}
                onChange={onSolidColorChange}
              />
              {isColorPickerActive ? (
                <div className="canvas-color-picker-active">
                  Click on the canvas to pick a color
                </div>
              ) : (
                <button
                  onClick={handleCanvasColorPick}
                  className="canvas-color-pick-btn"
                >
                  Pick Color from Canvas
                </button>
              )}
            </>
          ) : activeColorPicker?.startsWith("color") ? (
            <>
              <HexColorPicker
                color={customColors[activeColorPicker]}
                onChange={(color) => {
                  setCustomColors((prev) => ({
                    ...prev,
                    [activeColorPicker]: color,
                  }));
                }}
              />
              {isColorPickerActive ? (
                <div className="canvas-color-picker-active">
                  Click on the canvas to pick a color
                </div>
              ) : (
                <button
                  onClick={handleCanvasColorPick}
                  className="canvas-color-pick-btn"
                >
                  Pick Color from Canvas
                </button>
              )}
            </>
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
              value={currentGradientAngle}
              onChange={(_, value) => handleGradientAngleChange(value)}
              min={0}
              max={360}
            />
          </Stack>
        </div>
      )}

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
