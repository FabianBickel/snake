// 06.06.2023 Version 4: Spiel ohne Tastatur, Pause und Game Over

export function changeColorOfSvg(imageUrl, color, callback) {
  fetch(imageUrl)
    .then(response => response.text())
    .then(data => {
      let parser = new DOMParser();
      let svgDoc = parser.parseFromString(data, "image/svg+xml");

      let lines = svgDoc.querySelectorAll('line');
      lines.forEach((line) => {
        line.setAttribute('stroke', color);
      });

      let serializer = new XMLSerializer();
      let serializedSvg = serializer.serializeToString(svgDoc.documentElement);

      let image = new Image();
      image.src = 'data:image/svg+xml;charset=utf8,' + encodeURIComponent(serializedSvg);
      image.onload = () => {
        callback(image);
      };
    });
}

export function getComplementaryColor(color, adjustFactor) {
  if (!color) {
    return color;
  }
  const amount = isColorLight(color)
    ? 0 - adjustFactor
    : adjustFactor;

  let usePound = false;

  if (color[0] == "#") {
    color = color.slice(1);
    usePound = true;
  }

  const num = parseInt(color, 16);

  let r = (num >> 16) + amount;
  let b = ((num >> 8) & 0x00FF) + amount;
  let g = (num & 0x0000FF) + amount;

  if (r > 255) r = 255;
  else if (r < 0) r = 0;

  if (b > 255) b = 255;
  else if (b < 0) b = 0;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound ? "#" : "") + ((g | (b << 8) | (r << 16)) | 1 << 24).toString(16).slice(1);
}

function isColorLight(color) {
  const threshold = 127;
  const num = parseInt(color.slice(1), 16);
  const r = num >> 16;
  const g = (num >> 8) & 0x00FF;
  const b = num & 0x0000FF;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > (255 - threshold);
}