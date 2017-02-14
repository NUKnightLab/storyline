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
                   [moment("02/29/80", "MM/DD/YY"), 3],
                   [moment("03/31/80", "MM/DD/YY"), 2],
                   [moment("04/30/80", "MM/DD/YY"), 3],
                   [moment("05/30/80", "MM/DD/YY"), 2],
                  ]
      Chart1 = new Chart(
                 {
                   data: data,
                   bounds: {
                     minX: moment("01/21/80", "MM/DD/YY"),
                     maxX: moment("05/30/80", "MM/DD/YY"),
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
      range = sinon.stub(Chart1, 'setRange').returns(Chart1.rangeX = 1117494000000, Chart1.rangeY = 30)
    })
    it('should set the rangeX and rangeY of a chart', function() {
      expect(Chart1.rangeX).to.eql(1117494000000)
      expect(Chart1.rangeY).to.eql(30)
    })
    it('should provide xAxisRange when given an interval in a time denomination', function(){
      expect(Chart1.domain("month", 1)).to.eq(4);
    })
    it('shoulds provide yAxisRange if given an interval', function() {
      expect(Chart1.range()).to.eq(30)
    })
    xit('should return rangeX when given x as an input', function() {
      expect(Chart1.addTicks('x', 'years')).to.eq(10)
    })
    xit('should return rangeY when given y as an input', function() {
      expect(Chart1.addTicks('y', 'seconds')).to.eq(10)
    })
    afterEach(function() {
      range.restore();
    })
  })
})
