import { Slider, Stack } from "@mui/material";
import React from "react";

export default function Sidebar({
  onSizeChange,
  onAlbumSizeChange,
  albumSize,
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
      <button onClick={() => handleSizeChange(1920, 1080)}>1920x1080</button>
      <button onClick={() => handleSizeChange(1080, 1080)}>1080x1080</button>
      <button onClick={() => handleSizeChange(1080, 2400)}>1080x2400</button>
      <div className="sliders">
        <Stack spacing={2} direction="row" sx={{ alignItems: "center", mb: 1 }}>
          <p>Album Size</p>
          <Slider
            aria-label="AlbumSize"
            value={albumSize}
            onChange={handleSliderChange}
            min={50}
            max={200}
          />
        </Stack>
      </div>
    </div>
  );
}
