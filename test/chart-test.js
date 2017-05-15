import { Chart } from'../src/js/chart.js';
import { expect, assert } from 'chai'
import sinon from 'sinon'
import moment from 'moment'
const d3Time = require('d3-time-format');

describe('ChartJS', () => {
  let Chart1;
  describe('Instantiate a new chart', () => {
    let init;
    beforeEach(() => {
      init = sinon.stub(Chart.prototype, 'createChart');
      Chart1 = new Chart(
                 {
                   data: {},
                   bounds: {
                     minX: d3Time.timeParse("%m/%d/%Y")("01/21/80"),
                     maxX: d3Time.timeParse("%m/%d/%Y")("05/30/80"),
                     minY: null,
                     maxY: null
                   },
                   markers: null
                 }, 500, 600)
    })
    it('should set a margin to default if given no input', () => {
      expect(Chart1.margin).to.eql({ 'top': 10, 'right': 30, 'bottom': 20, 'left': 30 })
    })
    it('should return the height of a new chart with margins accounted for', () => {
      expect(Chart1.height).to.eql(545);
    })
    it('should return the width of a new chart with margins accounted for', () => {
      expect(Chart1.width).to.eql(440);
    })
    afterEach(function() {
      init.restore();
    })
  })
  describe('Check data created from new chart', () => {
    let stubCanvas,
        stubAxes,
        stubLine,
        stubMarkers
    beforeEach(() => {
      stubCanvas = sinon.stub(Chart.prototype, 'createCanvas');
      stubAxes = sinon.stub(Chart.prototype, 'drawAxes');
      stubLine = sinon.stub(Chart.prototype, 'drawLine');
      stubMarkers = sinon.stub(Chart.prototype, 'drawMarkers');

      let data = [
        [d3Time.timeParse("%m/%d/%Y")("01/21/80"), 1],
        [d3Time.timeParse("%m/%d/%Y")("02/29/80"), 3],
        [d3Time.timeParse("%m/%d/%Y")("03/31/80"), 2],
        [d3Time.timeParse("%m/%d/%Y")("04/30/80"), 3],
        [d3Time.timeParse("%m/%d/%Y")("05/30/80"), 2]
      ];
      let markers = [
        {rowNum: 3, slideTitle: 'Pentagon Militarizes Police', slideText: 'Some text here'},
        {rowNum: 4, slideTitle: 'Pentagon Militarizes Police', slideText: 'Some text here'}
      ]
      Chart1 = new Chart(
                     {
                       data: data,
                       bounds: {
                         minX: d3Time.timeParse("%m/%d/%Y")("01/21/80"),
                         maxX: d3Time.timeParse("%m/%d/%Y")("05/30/80"),
                         minY: 1,
                         maxY: 3
                       },
                       markers: markers
                     }, 500, 600)
    })
    it('should set a range', () => {
      expect(Chart1.rangeX).to.eql(11228400000)
      expect(Chart1.rangeY).to.eql(2)
    })
    it('should set a scale', () => {
      expect(Chart1.SCALEX).to.eql(3.562395354636458e-8)
      expect(Chart1.SCALEY).to.eql(272.5);
    })
    it('should set a translation', () => {
      expect(Chart1.translateX).to.eql(2124643.2831035587);
      expect(Chart1.translateY).to.eql(-272.5);
    })
    it('should aggregate markers when the aggregateMarkers is called', () => {
       var result = Chart1.aggregateMarkers()
         let markers = [
           { x: 307.66271240776405, y: 0, label: 3, markerCount: 0 },
           { x: 400, y: 272.5, label: 2, markerCount: 1 }
         ]
       assert.deepEqual(result, markers)
    })
    afterEach(function() {
      stubCanvas.restore();
      stubAxes.restore();
      stubLine.restore();
      stubMarkers.restore();
    })
  })
})
