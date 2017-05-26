import { Chart } from './chart';
import { DataFactory } from './data';
import { Slider } from './slider';
import { lib } from './lib';

var Storyline = function(targetId, dataConfig) {
  this.elem = document.getElementById(targetId);
  this.elem.className += 'Storyline'
  var self = this;
    self.dataConfig = dataConfig
    self.init()
}

Storyline.prototype = {
  init: function() {
    var self = this;
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
    return data.fetchSheetData(this.dataConfig);
  },
  initSlider: function(lastActiveCard) {
    var activeCard = !!lastActiveCard ? lastActiveCard : !!this.data.activeSlide ? this.data.activeSlide : 0
    var sliderHeight = (0.4*this.height)
    return new Slider(this.data.markers, activeCard, sliderHeight, this.width);
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

    for (var card of dataObj.markers) {
      if (card.display_date === undefined) {
        var row = dataObj.data[card.rowNum];
        // if row is null, we should have checked/errored before here
        card.displayDate = formatter(row[0]);
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
