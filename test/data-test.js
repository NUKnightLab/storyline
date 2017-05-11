import { DataFactory } from '../src/js/data.js';
import { lib } from '../src/js/lib.js';
import { expect, assert } from 'chai';
import moment from 'moment'
import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
chai.use(sinonChai)

describe('DataJS', () => {
  let config, requests, dataFactoryInstance;
  beforeEach(() => {
    config = {
      "data": {
        "url": "src/assets/dates_unemployment.csv"
      },
      "chart":{
      }
    }
    dataFactoryInstance = new DataFactory
  })
  describe('fetchData', () => {
    let exampleData, callBack, createData;
    beforeEach(() => {
      global.XMLHttpRequest = sinon.useFakeXMLHttpRequest();
      requests = [];

      const finalData = {
        date:
        [
          ['01/31/80',1],
          ['02/29/80',3],
          ['03/31/80',2],
          ['04/30/80', 3]
        ],
        bounds: {
          minX: null,
          maxX: null,
          minY: null,
          maxY: null
        },
        axes: {
          yLabel: null,
          timeFormat: null
        },
        markers: []
      }

      exampleData = "Date,US unemployment rate 1/31/80, 6.3 2/29/80 6.3, 3/31/80 6.3";
      callBack = sinon.stub(lib, 'get').returns(new Promise(function(resolve, reject) {
        resolve(exampleData);
      }))

      createData = sinon.stub(DataFactory.prototype, 'createDataObj').returns(finalData)
    })
    it('should invoke the get lib method with the proper file url', () => {
      let result = dataFactoryInstance.fetchData(config);
      sinon.assert.called(callBack)
      let options = callBack.getCall(0).args[0]
      expect(options).to.eq('src/assets/dates_unemployment.csv')
    })
    it('should return exampleData from get method', () => {
      dataFactoryInstance.fetchData(config);
      callBack().then(function(result) {
        expect(result).to.eq(exampleData)
      })
    })
    it('should resolve with a final data object', () => {
      const result = dataFactoryInstance.fetchData(config)
      result.then(function(result){
        expect(result).to.eq(finalData)
      })
    })
    afterEach(() => {
      global.XMLHttpRequest.restore()
      callBack.restore();
      createData.restore();
    })
  })
  describe('Create a dataObject from input data and config', () => {
    let dataInput, config, instance, stub, results;
    beforeEach(() => {
      dataInput = [
        {'date': '01/31/80', 'us unemployment rate': 1},
        {'date': '02/29/80', 'us unemployment rate': 3},
        {'date': '03/31/80', 'us unemployment rate': 2},
        {'date': '04/30/80', 'us unemployment rate': 3}
      ]
      config = {
        "data": {
          "data_column_name": "us unemployment rate",
          "datetime_format": "%m/%d/%Y",
          "datetime_column_name": "date"
        },
        "chart": {
          "datetime_format": "",
          "y_axis_label": ""
        }
      }
      stub = sinon.stub(DataFactory.prototype, 'getSlideMarkers')
      results = dataFactoryInstance.createDataObj(dataInput, config)
    })
    it('should convert dates to datetime objects', () => {
      for(var i in dataInput) {
        var datetime = dataInput[i]["date"].split("/"),
            month = datetime[0],
            date = datetime[1],
            year = datetime[2];

        assert.isOk(results.data[i][0].getTime(), new Date(month, date, year).getTime())
      }
    })
    it('should collect y axis value US Unemployment Rate in data object', () => {
      for(var i in dataInput) {
        expect(results.data[i][1]).to.eql(dataInput[i]["us unemployment rate"])
      }
    })
    it('should return the earliest date in bounds', () => {
      var date = dataInput[0].date.split("/"),
          month = date[0],
          date = date[1],
          year = date[2];

      assert.isOk(results.bounds.minX, new Date(month, date, year))
    })
    it('should return the latest date in bounds', () => {
      var date = dataInput[3].date.split("/"),
          month = date[0],
          date = date[1],
          year = date[2];

      assert.isOk(results.bounds.maxX, new Date(month, date, year))
    })
    afterEach(() => {
      stub.restore();
    })
  })
  describe('Throw error if column names are invalid', () => {
    let dataInput, config, stub, stubLib;
    beforeEach(()=> {
      dataInput = [
        {'date': '01/31/80', 'US Unemployment Rate': 1},
        {'date': '02/29/80', 'US Unemployment Rate': 3},
        {'date': '03/31/80', 'US Unemployment Rate': 2},
        {'date': '04/30/80', 'US Unemployment Rate': 3}
      ],
      stub = sinon.stub(DataFactory.prototype, 'getSlideMarkers')
      stubLib = sinon.stub(lib, 'errorLog');
    })
    it('returns an error message when y column_name is incorrect', () => {
      config = {
        "data": {
          "data_column_name": "US Unemployment",
          "datetime_format": "%m/%d/%Y",
          "datetime_column_name": "date"
        },
        "chart": {
          "datetime_format": "",
          "y_axis_label": ""
        }
      }
      let results = dataFactoryInstance.createDataObj(dataInput, config)
      sinon.assert.called(stubLib);
      let options = stubLib.getCall(0).args[0]
      expect(options.errorMessage).to.equal('y axis is invalid, check that your y axis column name is correct')
    })
    it('returns an error message when x column_name is incorrect', () => {
      config = {
        "data": {
          "data_column_name": "US Unemployment Rate",
          "datetime_format": "%m/%d/%Y",
          "datetime_column_name": "day"
        },
        "chart": {
          "datetime_format": "",
          "y_axis_label": ""
        }
      }
      let results = dataFactoryInstance.createDataObj(dataInput, config)
      sinon.assert.called(stubLib);
      let options = stubLib.getCall(0).args[0]
      expect(options.errorMessage).to.equal('x axis is invalid, check that your x axis column name is correct')
    })
    afterEach(() => {
      stub.restore();
      stubLib.restore();
    })
  })
  describe('Aggregate slide markers', () => {
    it('should be able to grab markers for slider', () => {
      const slides = [
        {
          "title": "Some Text",
          "text": "Additional Text Here",
          "row_number": 5
        },
        {
          "title": "Some Text",
          "text": "Additional Text Here",
          "row_number": 7
        },
        {
          "title": "Some Text",
          "text": "Additional Text Here",
          "row_number": 18
        }
      ]
      const results = dataFactoryInstance.getSlideMarkers(slides);
      assert.deepEqual(results, [5, 7, 18])
    })
  })
  describe('Data Manipulation methods', () => {
    it('should return the minimum given 2 numbers', () => {
      expect(dataFactoryInstance.getMin(54,45)).to.eq(45)
    })
    it('should return the earliest date given 2 dates', () => {
      var date1 = new Date('1980', '00', '01')
      var date2 = new Date('1980', '00', '03')
      expect(dataFactoryInstance.getMin(date1, date2)).to.eq(date1)
    })
    it('should return the maximum given 2 numbers', () => {
      expect(dataFactoryInstance.getMax(54,45)).to.eq(54)
    })
    it('should return the earliest date given 2 dates', () => {
      var date1 = new Date('1980', '00', '01')
      var date2 = new Date('1980', '00', '03')
      expect(dataFactoryInstance.getMax(date1, date2)).to.eq(date2)
    })
  })
})
