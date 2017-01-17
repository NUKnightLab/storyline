var parse = require('csv-parse');

import { data } from'../src/js/example.js';
import { expect, assert } from 'chai'

describe('Data File Parser', function() {
  describe('Read in csv', function() {
    it('should print out a variable', function() {
      var result = data().grabNode([
        {'DOY': '1', 'Temperature': '9'},
        {'DOY': '2', 'Temperature': '3'},
        {'DOY': '3', 'Temperature': '0.7'}], 'DOY')
      expect(result).to.eql(['1', '2', '3'], 'DOY')
    })
    it('should print result as k/v pair', function() {
      var input = '"key_1","key_2"\n"value 1","value 2"';
      parse(input, function(err, output) {
        expect(output).to.eql([{ key_1: 'value 1', key_2: 'value 2' }]);
      });
    })
  })
})
