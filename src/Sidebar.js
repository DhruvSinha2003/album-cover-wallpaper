import CropSquareIcon from "@mui/icons-material/CropSquare";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import { Slider, Stack } from "@mui/material";
import React from "react";
import "./Sidebar.css";

export default function Sidebar({
  onSizeChange,
  onAlbumSizeChange,
  albumSize,
  onDownload,
}) {
  const handleSizeChange = (width, height) => {
    onSizeChange({ width, height });
  };

  const handleSliderChange = (event, newValue) => {
    onAlbumSizeChange(newValue);
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
            value={albumSize}
            onChange={handleSliderChange}
            min={50}
            max={170}
          />
        </Stack>
      </div>
      <button onClick={onDownload} className="download-button">
        Download Wallpaper
      </button>
    </div>
  );
}
