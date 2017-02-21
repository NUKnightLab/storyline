var parse = require('csv-parse');

describe('Check CSV parser', function() {
  describe('parse comma separated values', function() {
    it('should print result as k/v pair', function() {
      var input = '"key_1","key_2"\n"value 1","value 2"';
      parse(input, function(err, output) {
        expect(output).to.eql([{ key_1: 'value 1', key_2: 'value 2' }]);
      });
    })
  })
})
