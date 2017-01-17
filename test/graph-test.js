import { graph } from'../src/js/graph.js';
import { expect, assert } from 'chai'

describe('Create new graph', function() {
  describe('create a new graph', function() {
    var chart;
    beforeEach(function() {
      chart = new graph.Chart(500, 600, null, null) 
    })
    it('should return the height of a new chart', function() {
      expect(chart.h).to.eql(600);
    })
    it('should return the width of a new chart', function() {
      expect(chart.w).to.eql(500);
    })
  })
})
