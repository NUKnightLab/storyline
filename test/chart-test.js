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
      let data = [
                   [d3Time.timeParse("%m/%d/%Y")("01/21/80"), 1],
                   [d3Time.timeParse("%m/%d/%Y")("02/29/80"), 3],
                   [d3Time.timeParse("%m/%d/%Y")("03/31/80"), 2],
                   [d3Time.timeParse("%m/%d/%Y")("04/30/80"), 3],
                   [d3Time.timeParse("%m/%d/%Y")("05/30/80"), 2]
                 ];
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
})
