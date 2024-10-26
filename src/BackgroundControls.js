// BackgroundControls.js
import React from "react";
import { HexColorPicker } from "react-colorful";

const BackgroundControls = ({
  useGradient,
  onGradientToggle,
  gradientAngle,
  onGradientAngleChange,
  solidColor,
  onSolidColorChange,
}) => {
  const angleOptions = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <div className="background-controls">
      <div className="control-section">
        <h3>Background Type</h3>
        <div className="toggle-buttons">
          <button
            className={!useGradient ? "active" : ""}
            onClick={() => onGradientToggle(false)}
          >
            Solid Color
          </button>
          <button
            className={useGradient ? "active" : ""}
            onClick={() => onGradientToggle(true)}
          >
            Gradient
          </button>
        </div>
      </div>

      {useGradient ? (
        <div className="control-section">
          <h3>Gradient Angle</h3>
          <div className="angle-buttons">
            {angleOptions.map((angle) => (
              <button
                key={angle}
                className={gradientAngle === angle ? "active" : ""}
                onClick={() => onGradientAngleChange(angle)}
              >
                {angle}°
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="control-section">
          <h3>Background Color</h3>
          <HexColorPicker color={solidColor} onChange={onSolidColorChange} />
        </div>
      )}
    </div>
  );
};

export default BackgroundControls;
