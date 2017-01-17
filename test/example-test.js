//var thing = require('../src/example.js')	
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
  })
})
