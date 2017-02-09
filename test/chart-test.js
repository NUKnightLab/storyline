import { Chart } from'../src/js/chart.js';
import { expect, assert } from 'chai'
import sinon from 'sinon'
import moment from 'moment'

describe('Checking chart functions', function() {
  var Chart1
  describe('create a new graph', function() {
    var init;
    beforeEach(function() {
      init = sinon.stub(Chart.prototype, 'init');
      var data = [
                   [moment("01/21/80", "MM/DD/YY"), 1],
                   [moment("12/29/80", "MM/DD/YY"), 3],
                   [moment("13/31/80", "MM/DD/YY"), 2],
                   [moment("14/30/80", "MM/DD/YY"), 3],
                   [moment("15/30/80", "MM/DD/YY"), 2],
                  ]
      Chart1 = new Chart(
                 {
                   data: data,
                   bounds: {
                     minX: null,
                     maxX: null,
                     minY: null,
                     maxY: null
                   },
                   intervals: null,
                   markers: null
                 }, 500, 600)
    })
    it('should return the height of a new chart', function() {
      expect(Chart1.height).to.eql(600);
    })
    it('should return the width of a new chart', function() {
      expect(Chart1.width).to.eql(500);
    })
    afterEach(function() {
      init.restore();
    })
  })
  describe('create a logical tick mark', function() {
    var range;
    beforeEach(function() {
      range = sinon.stub(Chart1, 'setRange').returns(Chart1.rangeX = 50, Chart1.rangeY = 30)
    })
    it('should set the rangeX and rangeY of a chart', function() {
      expect(Chart1.rangeX).to.eql(50)
      expect(Chart1.rangeY).to.eql(30)
    })
    it('should return rangeX when given x as an input', function() {
      expect(Chart1.addTicks('x')).to.eq(50)
    })
    it('should return rangeY when given y as an input', function() {
      expect(Chart1.addTicks('y')).to.eq(30)
    })
    afterEach(function() {
      range.restore();
    })
  })
})
