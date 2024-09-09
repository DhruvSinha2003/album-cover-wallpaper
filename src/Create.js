import React from "react";
import { useLocation } from "react-router-dom";

export default function Create() {
  const location = useLocation();
  const { image } = location.state || {};

  return (
    <div>
      <h1>Create Wallpaper</h1>
      {image ? (
        <img
          src={image}
          alt="album cover"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      ) : (
        <p>No image provided</p>
      )}
    </div>
  );
}
