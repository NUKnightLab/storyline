var readCSV = require('./example.js');

function graph() {

  function init() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    var svgNS = svg.namespaceURI;
        var rect = document.createElementNS(svgNS,'rect');
        rect.setAttribute('x',5);
        rect.setAttribute('y',5);
        rect.setAttribute('width',500);
        rect.setAttribute('height',500);
        rect.setAttribute('fill','#95B3D7');
        svg.appendChild(rect);
        document.body.appendChild(svg);
  }

  return {
    init: init
  }
}

module.exports = {
  graph
}
