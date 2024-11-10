import { createContext, useContext, useState } from "react";

const GradientContext = createContext();

export const GradientProvider = ({ children }) => {
  const [customGradient, setCustomGradient] = useState({
    color1: "#FF5733",
    color2: "#33FF57",
    color3: "#3357FF",
    color4: "#F033FF",
    angle: 45,
    isCustom: false,
  });

  const updateCustomGradient = (updates) => {
    setCustomGradient((prev) => ({ ...prev, ...updates }));
  };

  return (
    <GradientContext.Provider value={{ customGradient, updateCustomGradient }}>
      {children}
    </GradientContext.Provider>
  );
};

export const useGradient = () => useContext(GradientContext);
