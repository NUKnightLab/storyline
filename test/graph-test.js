import { Chart } from'../src/js/chart.js';
import { expect, assert } from 'chai'

describe('Create new graph', function() {
  describe('create a new graph', function() {
    var Chart1;
    beforeEach(function() {
      Chart1 = new Chart();
      Chart1.dimensions(500, 600, null, null);
    })
    it('should return the height of a new chart', function() {
      expect(Chart1.h).to.eql(600);
    })
    it('should return the width of a new chart', function() {
      expect(Chart1.w).to.eql(500);
    })
  })
})
