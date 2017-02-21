import { DataFactoryFunc } from '../src/js/data.js';
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
      filename: "src/assets/dates_unemployment.csv",
      dateFormat: "MM/DD/YY",
      slides: {},
      startIndex: 2
    }
    dataFactoryInstance = new DataFactoryFunc
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
    it('should return a promise from calling fetchData', () => {
      const result = dataFactoryInstance.fetchData({})
      expect(result.then).to.be.a('Function')
      expect(result.catch).to.be.a('Function')
    })
    it('should resolve and return with a data string from the get request in fetchData', () => {
      dataFactoryInstance.fetchData(config).then(function(response) {
        expect(response).to.eql(exampleData)
      })
    })
    afterEach(() => {
      global.XMLHttpRequest.restore()
      callBack.restore();
    })
  })
  describe('grabData', () => {
    let dataInput, config, instance;
    beforeEach(() => {
      dataInput = [
        {'date': '01/31/80', 'US Unemployment Rate': 1},
        {'date': '02/29/80', 'US Unemployment Rate': 3},
        {'date': '03/31/80', 'US Unemployment Rate': 2},
        {'date': '04/30/80', 'US Unemployment Rate': 3}
      ]
      config = {
        xAxis: 'date',
        xLabel: 'month',
        xTickInterval: '1',
        yAxis: 'US Unemployment Rate',
        yLabel: 'US Unemployment Rate',
        yTickInterval: 1,
        dateFormat: 'MM/DD/YY'
      }
    })
    it('should return an object with data, bounds, axes and markers', () => {
      const stub = sinon.stub(DataFactoryFunc.prototype, 'getSlideMarkers')
      const results = dataFactoryInstance.grabData(dataInput, config)
      for(var i in dataInput) {
        assert.isOk(results.data[i][0].isSame(moment(dataInput[i]["date"], config.dateFormat)))
      }
      for(var i in dataInput) {
        expect(results.data[i][1]).to.eql(dataInput[i]["US Unemployment Rate"])
      }
      assert.isOk(results.bounds.minX.isSame(moment(dataInput[0]["date"], config.dateFormat)))
      assert.isOk(results.bounds.maxX.isSame(moment(dataInput[3]["date"], config.dateFormat)))

      stub.restore();
    })
    it('should be able to grab markers for slider', () => {
      const slides = [
        {
          "title": "Some Text",
          "text": "Additional Text Here",
          "rowNum": 5
        },
        {
          "title": "Some Text",
          "text": "Additional Text Here",
          "rowNum": 7
        },
        {
          "title": "Some Text",
          "text": "Additional Text Here",
          "rowNum": 18
        }
      ]
      const results = dataFactoryInstance.getSlideMarkers(slides);
      assert.deepEqual(results, [5, 7, 18])
    })
  })
})
