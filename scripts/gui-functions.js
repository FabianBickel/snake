

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