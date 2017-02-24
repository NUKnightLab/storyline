import { Chart } from './chart';
import { DataFactoryFunc } from './data';
import { Slider } from './slider';

var Storyline = function(targetId, config) {
  var self = this;
  this.elem = document.getElementById(targetId);
  this.config = config;
  this.init();

}

Storyline.prototype = {
  init: function() {
    this.setDimensions();
    this.setListener();
    this.createSlider();
    this.createChart().then(function(context) {
      var self = context;
      self.appendSlider(self.slider);
      self.slider.moveSlide();
      self.slider.attachClickHandler(self.chart.markers);
    });
  },
  createSlider: function() {
    var slides = this.config.slides,
        startIndex = this.config.startIndex,
        slider;

    this.slider = new Slider(slides, startIndex);
  },
  createChart: function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      var data = new DataFactoryFunc;
      data.fetchData(self.config).then(function(dataObj) {
        self.chart = new Chart(dataObj, self.width, self.height, self.margin)
        self.appendChart(self.chart)
        resolve(self)
      })
    })
  },
  /**
   * checks browser size and if mobile, overrides input dimensions
   *
   * @returns {undefined}
   */
  setDimensions: function() {
    this.height = this.elem.getAttribute('height');
    this.elem.style.height = this.height + "px";
    this.width = this.elem.getAttribute('width');
    this.elem.style.width = this.width + "px";
  },
  attr: function(dimension, value) {
    if(dimension == "height") {
      this.height = value;
      this.container.style.height = value + "px";
    } else if(dimension == "width") {
      this.width = value;
      this.container.style.width = value + "px";
    } else if(dimension == "margin") {
      this.margin = value;
    }
  },
  buildSlides: function(config, targetId) {
    config
  },
  appendChart: function(chart) {
    this.elem.appendChild(chart.canvas);
    //chart.setWidth(this.width)
  },
  appendSlider: function(slider) {
    this.elem.appendChild(slider.elem);
    slider.setWidth(this.width)
    slider.elem.style.opacity = 1;
  },
  setListener: function() {
    PubSub.subscribe('window resized', function(topic, data) {
      var screen = parseFloat(data.value.split("em")[0]);
      if(screen <= 30) {
        //make phone mode//

      } else if(screen >= 64) {
        //redraw fullscreen mode//
      }
    })
  }
}

module.exports = {
  Storyline
}
