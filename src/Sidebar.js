import CropSquareIcon from "@mui/icons-material/CropSquare";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import { FormControlLabel, Slider, Stack, Switch } from "@mui/material";
import debounce from "lodash/debounce";
import React, { useCallback, useState } from "react";
import { HexColorPicker } from "react-colorful";
import "./Sidebar.css";

export default function Sidebar({
  onSizeChange,
  onAlbumSizeChange,
  albumSize,
  onDownload,
  onGradientToggle,
  onGradientAngleChange,
  useGradient,
  gradientAngle,
  solidColor,
  onSolidColorChange,
}) {
  const [localAlbumSize, setLocalAlbumSize] = useState(albumSize);
  const angleOptions = [0, 45, 90, 135, 180, 225, 270, 315];

  const handleSizeChange = (width, height) => {
    onSizeChange({ width, height });
  };

  const debouncedAlbumSizeChange = useCallback(
    debounce((newValue) => {
      onAlbumSizeChange(newValue);
    }, 100),
    [onAlbumSizeChange]
  );

  const handleSliderChange = (event, newValue) => {
    setLocalAlbumSize(newValue);
    debouncedAlbumSizeChange(newValue);
  };

  const handleGradientToggle = (event) => {
    onGradientToggle(event.target.checked);
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
        <FormControlLabel
          control={
            <Switch
              checked={useGradient}
              onChange={handleGradientToggle}
              name="gradientToggle"
            />
          }
          label="Use Gradient Background"
        />

        {useGradient ? (
          <div className="gradient-controls">
            <h4>Gradient Angle</h4>
            <div className="angle-buttons">
              {angleOptions.map((angle) => (
                <button
                  key={angle}
                  className={`angle-button ${
                    gradientAngle === angle ? "active" : ""
                  }`}
                  onClick={() => onGradientAngleChange(angle)}
                >
                  {angle}°
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="color-picker-container">
            <h4>Background Color</h4>
            <HexColorPicker
              color={solidColor}
              onChange={onSolidColorChange}
              className="color-picker"
            />
          </div>
        )}
      </section>

      <button onClick={onDownload} className="download-button">
        Download Wallpaper
      </button>
    </div>
  );
}
