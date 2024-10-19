import CropSquareIcon from "@mui/icons-material/CropSquare";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import { FormControlLabel, Slider, Stack, Switch } from "@mui/material";
import debounce from "lodash/debounce";
import React, { useCallback, useState } from "react";
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
}) {
  const [localAlbumSize, setLocalAlbumSize] = useState(albumSize);
  const [localGradientAngle, setLocalGradientAngle] = useState(gradientAngle);

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

  const debouncedGradientAngleChange = useCallback(
    debounce((newValue) => {
      onGradientAngleChange(newValue);
    }, 100),
    [onGradientAngleChange]
  );

  const handleGradientAngleChange = (event, newValue) => {
    setLocalGradientAngle(newValue);
    debouncedGradientAngleChange(newValue);
  };

  return (
    <div className="sidebar">
      <h3>Canvas Size</h3>
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
      <div className="sliders">
        <Stack spacing={2} direction="row" sx={{ alignItems: "center", mb: 1 }}>
          <p>Album Size</p>
          <Slider
            aria-label="AlbumSize"
            value={localAlbumSize}
            onChange={handleSliderChange}
            min={50}
            max={170}
          />
        </Stack>
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
        {useGradient && (
          <Stack
            spacing={2}
            direction="row"
            sx={{ alignItems: "center", mt: 1 }}
          >
            <p>Gradient Angle</p>
            <Slider
              aria-label="GradientAngle"
              value={localGradientAngle}
              onChange={handleGradientAngleChange}
              min={0}
              max={360}
            />
          </Stack>
        )}
      </div>
      <button onClick={onDownload} className="download-button">
        Download Wallpaper
      </button>
    </div>
  );
}
