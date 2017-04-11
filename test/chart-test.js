import { Chart } from'../src/js/chart.js';
import { expect, assert } from 'chai'
import sinon from 'sinon'
import moment from 'moment'
import d3Time from 'd3-time-format'

describe('ChartJS', () => {
  let Chart1;
  describe('Instantiate a new chart', () => {
    let init;
    beforeEach(() => {
      init = sinon.stub(Chart.prototype, 'createChart');
      let data = [
                   [moment("01/21/80", "MM/DD/YY"), 1],
                   [moment("02/29/80", "MM/DD/YY"), 3],
                   [moment("03/31/80", "MM/DD/YY"), 2],
                   [moment("04/30/80", "MM/DD/YY"), 3],
                   [moment("05/30/80", "MM/DD/YY"), 2],
                 ];
      Chart1 = new Chart(
                 {
                   //data: data,
                   //bounds: {
                   //  minX: d3Time.timeParse("%m/%d/%Y")("01/21/80"),
                   //  maxX: d3Time.timeParse("%m/%d/%Y")("05/30/80"),
                   //  minY: null,
                   //  maxY: null
                   //},
                   //markers: null
                 }, 500, 600)
    })
    it('should set a margin to default if given no input', () => {
      expect(Chart1.margin).to.eql({ 'top': 10, 'right': 30, 'bottom': 20, 'left': 30 })
    })
    xit('should return the height of a new chart with margins accounted for', () => {
      expect(Chart1.height).to.eql(540);
    })
    xit('should return the width of a new chart with margins accounted for', () => {
      expect(Chart1.width).to.eql(430);
    })
    afterEach(function() {
      init.restore();
    })
  })
  describe('Create the domain', () => {
    beforeEach(function() {
      //range = sinon.stub(Chart1, 'setRange').returns(Chart1.rangeX = 1117494000000, Chart1.rangeY = 30)
      Chart1.axes = {
                      xAxis: null,
                      xLabel: "month",
                      xTick: 1,
                    }
    })
    xit('should create an array of ticks with the start year as the first item and last year not included', () => {
      var result = Chart1.createTicks(1980, 2015, 10)
      expect(result.length).to.eq(4);
      assert.deepEqual(result, [ 1980, 1990, 2000, 2010 ]);
    })
    xit('should create an array of ticks with the start year as first item and last year included', () => {
      var result = Chart1.createTicks(1980, 2015, 5)
      expect(result.length).to.eq(8);
      assert.deepEqual(result, [ 1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015 ]);
    })
    xit('should create an object of domain attributes', () => {
      var result = Chart1.makeDomain()
      expect(result.distance).to.eq(4);
      assert.deepEqual(result.ticks, [0,1,2,3,4]);
      expect(result.label).to.eq("month");
    })
    //afterEach(() =>
      //range.restore()
    //)
  })
  describe('Create the range', () => {
    beforeEach(() => {
      Chart1.axes = {
                      yAxis: null,
                      yLabel: "Number of Flights",
                      yTick: 1,
                    }
      Chart1.bounds = {
        minY: 1,
        maxY: 5
      }
    })
    xit('should create an array of ticks with start as first item in the list', () => {
      var result = Chart1.createTicks(1,5)
      expect(result.length).to.eq(5);
      assert.deepEqual(result, [1,2,3,4,5]);
    })
    xit('should create an object of range attributes', () => {
      const result = Chart1.makeRange();
      assert.deepEqual(result.ticks, [1,2,3,4,5])
      expect(result.label).to.eq("Number of Flights")
    })
  })
})
