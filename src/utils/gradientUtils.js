// gradientUtils.js
export const extractDistinctColors = (imageData) => {
  const colorCounts = {};
  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const color = `rgb(${r},${g},${b})`;
    colorCounts[color] = (colorCounts[color] || 0) + 1;
  }

  const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);

  // Filter out very light and very dark colors
  const filteredColors = sortedColors.filter(([color]) => {
    const [r, g, b] = color.match(/\d+/g).map(Number);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const saturation = Math.max(r, g, b) - Math.min(r, g, b);
    return brightness > 20 && brightness < 230 && saturation > 30;
  });

  // Get two most distinct colors
  const getColorDistance = (color1, color2) => {
    const [r1, g1, b1] = color1.match(/\d+/g).map(Number);
    const [r2, g2, b2] = color2.match(/\d+/g).map(Number);
    return Math.sqrt(
      Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2)
    );
  };

  let mostDistinct = [filteredColors[0][0]];
  if (filteredColors.length > 1) {
    let maxDistance = 0;
    for (let i = 1; i < Math.min(filteredColors.length, 5); i++) {
      const distance = getColorDistance(
        filteredColors[0][0],
        filteredColors[i][0]
      );
      if (distance > maxDistance) {
        maxDistance = distance;
        mostDistinct[1] = filteredColors[i][0];
      }
    }
  }

  return mostDistinct;
};

export const createGradient = (ctx, width, height, colors, angle) => {
  const adjustedAngle = Math.floor(angle / 15) * 15; // Round to nearest 15 degrees
  const gradient = ctx.createLinearGradient(
    0,
    0,
    Math.cos((adjustedAngle * Math.PI) / 180) * width,
    Math.sin((adjustedAngle * Math.PI) / 180) * height
  );

  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });

  return gradient;
};