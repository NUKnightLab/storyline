import { DataFactory } from '../src/js/data.js';
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
    let exampleData, callBack;
    beforeEach(() => {
      global.XMLHttpRequest = sinon.useFakeXMLHttpRequest();
      requests = [];

      XMLHttpRequest.onCreate = function (xhr) {
        requests.push(xhr);
      };

      exampleData = "Date,US unemployment rate 1/31/80, 6.3 2/29/80 6.3, 3/31/80 6.3";
      callBack = sinon.stub(dataFactoryInstance, 'get').returns(new Promise(function(resolve, reject) {
        resolve(exampleData);
      }))
    })

    xit('should return a promise from calling fetchData', () => {
      const result = dataFactoryInstance.fetchData(config)
        console.log(result)
      expect(result.then).to.be.a('Function')
      expect(result).to.be.a('Function')
    })
    xit('should resolve and return with a data string from the get request in fetchData', () => {
      dataFactoryInstance.fetchData(config).then(function(response) {
        expect(response).to.eql(exampleData)
      })
    })
    afterEach(() => {
      global.XMLHttpRequest.restore()
      callBack.restore();
    })
  })
  describe('Create a dataObject from input data and config', () => {
    let dataInput, config, instance, stub, results;
    beforeEach(() => {
      dataInput = [
        {'date': '01/31/80', 'US Unemployment Rate': 1},
        {'date': '02/29/80', 'US Unemployment Rate': 3},
        {'date': '03/31/80', 'US Unemployment Rate': 2},
        {'date': '04/30/80', 'US Unemployment Rate': 3}
      ]
      config = {
        "data": {
          "data_column_name": "US Unemployment Rate",
          "datetime_format": "%m/%d/%Y",
          "datetime_column_name": "date"
        },
        "chart": {
          "datetime_format": "",
          "y_axis_label": ""
        }
      }
      //code heere//
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
        expect(results.data[i][1]).to.eql(dataInput[i]["US Unemployment Rate"])
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
