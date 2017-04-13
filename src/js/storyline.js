import { Chart } from './chart';
import { DataFactory } from './data';
import { Slider } from './slider';
import ua from 'universal-analytics'

var Storyline = function(targetId, dataConfig) {
  this.elem = document.getElementById(targetId);
  var self = this;
  if (typeof dataConfig == 'string') {
    var req = new XMLHttpRequest;
    req.addEventListener("load", function() {
      var config = JSON.parse(this.responseText);
      self.dataConfig = config;
      self.init();
    });
    // TODO: add error handling to request
    req.open("GET", dataConfig);
    req.send();
  } else {
    this.dataConfig = dataConfig;
    this.init();
  }
}

Storyline.prototype = {
  init: function() {
    var self = this;
    self.tracking();
    this.setDimensions();
    this.grabData(this.dataConfig).then(function(dataObj) {
      self.data = dataObj;
      self.chart = self.initChart(dataObj);
      // slider cards include dates so must happen after data is grabbed
      self.populateSlideDates(dataObj);
      self.slider = self.initSlider();
      self.positionChart(self.chart)
      self.positionSlider(self.slider)
    });
    PubSub.subscribe('window resized', function(topic, data) {
      self.resetWidth(data);
    })
  },
  tracking: function() {
    this.visitor = ua('UA-27829802-5');
    //this.visitor.event('Navigation', this.slider.handleClick, function(err) {console.log(err)})
  },
  resetWidth: function(newWidth) {
    this.width = newWidth;
    var oldSlider = this.slider.elem
    var lastActiveCard = this.slider.activeCard;
    var oldChart = this.chart.canvas
    oldSlider.remove();
    oldChart.remove();
    this.slider = this.initSlider(lastActiveCard);
    this.chart = this.initChart(this.data)
    this.positionChart(this.chart)
    this.positionSlider(this.slider)
  },
  grabData: function() {
    var data = new DataFactory;
    return data.fetchData(this.dataConfig);
  },
  initSlider: function(lastActiveCard) {
    var activeCard = !!lastActiveCard ? lastActiveCard : this.dataConfig.start_at_card
    var sliderHeight = (0.4*this.height)
    return new Slider(this.dataConfig.cards, activeCard, sliderHeight, this.width);
  },
  initChart: function(dataObj) {
    //chart height//
    var chartHeight = !!this.chartHeight ? this.chartHeight : (0.6*this.height);
    return new Chart(dataObj, this.width, chartHeight, this.margin)
  },
  /**
   * For each slide configuration object, if no display_date is specified,
   * fill it in based on the data set.
   *
   * @returns {undefined}
   */
  populateSlideDates: function(dataObj) {
    var d3Time = require('d3-time-format'),
        formatter = d3Time.timeFormat(this.dataConfig.chart.datetime_format);

    for (var card of this.dataConfig.cards) {
      if (card.display_date === undefined) {
        var row = dataObj.data[card.row_number];
        // if row is null, we should have checked/errored before here
        card.display_date = formatter(row[0]);
      }
    }
  },
  /**
   * checks browser size and if mobile, overrides input dimensions
   *
   * @returns {undefined}
   */
  setDimensions: function(width) {
    this.width = width ? width : window.innerWidth;
    this.height = this.elem.getAttribute('height');
    //slider has a max height of 246px so let chart take up the additional space//
    if(0.4*this.height > 246) {
      this.chartHeight = this.height - 246;
    }
  },
  attr: function(dimension, value) {
    if(dimension == "height") {
      this.height = value;
      this.elem.style.height = value + "px";
    } else if(dimension == "width") {
      this.width = value;
      this.elem.style.width = value + "px";
    } else if(dimension == "margin") {
      this.margin = value;
    }
  },
  positionChart: function(chart) {
    this.elem.appendChild(chart.canvas);
    //chart.setWidth(this.width)
  },
  positionSlider: function(slider) {
    this.elem.appendChild(slider.elem);
    slider.setWidth(this.width)
    slider.goToCard();
    slider.slideCard();
    slider.attachClickHandler(this.chart.markers);
    slider.elem.style.opacity = 1;
  }
}

module.exports = {
  Storyline
}
