var parse = require('csv-parse');

import { grabNode } from'../src/js/data.js';
const moment = require('moment');
import { expect, assert } from 'chai'

describe('Data File Parser', function() {
  describe('Read in csv', function() {
    var input, config
    beforeEach(function() {
      input = [{'DOY': '1/31/80', 'Temperature': '9'},
               {'DOY': '3/4/80', 'Temperature': '3'},
               {'DOY': '4/5/80', 'Temperature': '0.7'}]
      })
      config = {"xAxis": 'DOY', "yAxis": 'Temperature', "dateFormat": 'MM/DD/YY'}
    it('should make sure time is in the correct format', function() {
      var result = grabNode(input, config)
      for(var i in input) {
        assert.isOk(result.data[i][0].isSame(moment(input[i]["DOY"], config.dateFormat)))
      }
    })
    it('should ensure y value is parsed', function() {
      var result = grabNode(input, config)
      expect(result.data[0][1]).equal(9)
    })
    it('should print result as k/v pair', function() {
      var input = '"key_1","key_2"\n"value 1","value 2"';
      parse(input, function(err, output) {
        expect(output).to.eql([{ key_1: 'value 1', key_2: 'value 2' }]);
      });
    })
    it('should get the correct bounds', function() {
      var result = grabNode(input,config)
console.log(result.bounds)
      assert.isOk(result.bounds.minX.isSame(moment(input[0]["DOY"], config.dateFormat)))
      assert.isOk(result.bounds.maxX.isSame(moment(input[2]["DOY"], config.dateFormat)))
    })
  })
})
