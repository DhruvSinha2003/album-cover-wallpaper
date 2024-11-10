import { useState, useCallback } from "react";

export const useShadowEffect = (initialIntensity = 0) => {
  const [shadowConfig, setShadowConfig] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    blur: 20,
    intensity: initialIntensity,
    mode: "uniform",
  });

  const updateShadowConfig = useCallback((config) => {
    setShadowConfig(config);
    const shadowIntensity =
      config.mode === "uniform"
        ? config.intensity
        : Math.max(config.top, config.right, config.bottom, config.left);

    return {
      intensity: shadowIntensity,
      config: config,
    };
  }, []);

  return [shadowConfig, updateShadowConfig];
};
