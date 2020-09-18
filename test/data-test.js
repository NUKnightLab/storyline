import { DataFactory, isBlankRow } from '../src/js/data.js';
import { lib } from '../src/js/lib.js';
import { expect, assert } from 'chai';

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
            "chart": {}
        }
        dataFactoryInstance = new DataFactory()
    })
    describe('fetchData', () => {
        let exampleData, callBack, createData;
        beforeEach(() => {
            global.XMLHttpRequest = sinon.useFakeXMLHttpRequest();
            requests = [];

            const finalData = {
                date: [
                    ['01/31/80', 1],
                    ['02/29/80', 3],
                    ['03/31/80', 2],
                    ['04/30/80', 3],
                    ['05/30/80', 2],
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

            exampleData = "Date,us unemployment rate 1/31/80, 6.3 2/29/80 6.3, 3/31/80 6.3";
            callBack = sinon.stub(lib, 'get').returns(new Promise(function(resolve, reject) {
                resolve(exampleData);
            }))

            createData = sinon.stub(DataFactory.prototype, 'createDataObj').returns(finalData)
        })
        it('should invoke the get lib method with the proper file url', () => {
            let result = dataFactoryInstance.fetchSheetData(config);
            sinon.assert.called(callBack)
            let options = callBack.getCall(0).args[0]
            expect(options).to.eq('src/assets/dates_unemployment.csv')
        })
        it('should return exampleData from get method', () => {
            dataFactoryInstance.fetchSheetData(config);
            callBack().then(function(result) {
                expect(result).to.eq(exampleData)
            })
        })
        it('should resolve with a final data object', () => {
            const result = dataFactoryInstance.fetchSheetData(config)
            result.then(function(result) {
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
        let dataInput, config, instance, results;
        beforeEach(() => {
            dataInput = [
                { 'date': '01/31/80', 'us unemployment rate': 0, 'title': { $t: 'title' }, 'text': { $t: 'text' } },
                { 'date': '02/29/80', 'us unemployment rate': 3, 'title': { $t: 'title' }, 'text': { $t: 'text' } },
                { 'date': '03/31/80', 'us unemployment rate': 2, 'title': { $t: 'title' }, 'text': { $t: 'text' } },
                { 'date': '04/30/80', 'us unemployment rate': 3, 'title': { $t: 'title' }, 'text': { $t: 'text' } }
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
                },
                "slider": {
                    'title_column_name': 'title',
                    'text_column_name': 'text'
                }
            }
            results = dataFactoryInstance.createDataObj(dataInput, config)
        })
        it('should convert dates to datetime objects', () => {
            for (var i in dataInput) {
                var datetime = dataInput[i]["date"].split("/"),
                    month = datetime[0],
                    date = datetime[1],
                    year = datetime[2];

                assert.isOk(results.data[i][0].getTime(), new Date(month, date, year).getTime())
            }
        })
        it('should collect y axis value US Unemployment Rate in data object', () => {
            for (var i in dataInput) {
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
        afterEach(() => {})
    })
    describe('Throw error if column names are invalid', () => {
        let dataInput, config, stub;
        beforeEach(() => {
            dataInput = [
                { 'date': '01/31/80', 'us unemployment rate': 1, 'title': { $t: 'title' }, 'text': { $t: 'text' } },
                { 'date': '02/29/80', 'us unemployment rate': 3, 'title': { $t: 'title' }, 'text': { $t: 'text' } },
                { 'date': '03/31/80', 'us unemployment rate': 2, 'title': { $t: 'title' }, 'text': { $t: 'text' } },
                { 'date': '04/30/80', 'us unemployment rate': 3, 'title': { $t: 'title' }, 'text': { $t: 'text' } }
            ]
        })
        it('throws an error message when data column_name is incorrect', () => {
            config = {
                "data": {
                    "data_column_name": "the wrong configuration",
                    "datetime_format": "%m/%d/%Y",
                    "datetime_column_name": "date"
                },
                "chart": {
                    "datetime_format": "",
                    "y_axis_label": ""
                },
                "slider": {
                    'title_column_name': 'title',
                    'text_column_name': 'text'
                }
            }
            expect(function() { dataFactoryInstance.createDataObj(dataInput, config) }).to.throw();
        })
        it('throws an error message when date column_name is incorrect', () => {
            config = {
                "data": {
                    "data_column_name": "us unemployment rate",
                    "datetime_format": "%m/%d/%Y",
                    "datetime_column_name": "day"
                },
                "chart": {
                    "datetime_format": "",
                    "y_axis_label": ""
                },
                "slider": {
                    'title_column_name': 'title',
                    'text_column_name': 'text'
                }
            }
            expect(function() { dataFactoryInstance.createDataObj(dataInput, config) }).to.throw();
        })
        afterEach(() => {})
    })
    describe('Data Manipulation methods', () => {
        it('should return the minimum given 2 numbers', () => {
            expect(dataFactoryInstance.getMin(54, 45)).to.eq(45)
        })
        it('should return the earliest date given 2 dates', () => {
            var date1 = new Date('1980', '00', '01')
            var date2 = new Date('1980', '00', '03')
            expect(dataFactoryInstance.getMin(date1, date2)).to.eq(date1)
        })
        it('should return the maximum given 2 numbers', () => {
            expect(dataFactoryInstance.getMax(54, 45)).to.eq(54)
        })
        it('should return the earliest date given 2 dates', () => {
            var date1 = new Date('1980', '00', '01')
            var date2 = new Date('1980', '00', '03')
            expect(dataFactoryInstance.getMax(date1, date2)).to.eq(date2)
        })
    })
    describe('URL testing', () => {
        it('should parse a basic URL', () => {
            let url = 'https://docs.google.com/spreadsheets/d/1z4f_-m8mqp2-yR0Rx-R4xDA_cVKCW1Bd5KxgIFDOT7U/pubhtml'
            let expected = 'https://docs.google.com/spreadsheets/d/1z4f_-m8mqp2-yR0Rx-R4xDA_cVKCW1Bd5KxgIFDOT7U/pub?output=csv'
            expect(DataFactory.getCSVURL({ data: { url: url } })).to.eq(expected)
        })
        it('should parse an edit URL', () => {
            let url = 'https://docs.google.com/spreadsheets/d/1z4f_-m8mqp2-yR0Rx-R4xDA_cVKCW1Bd5KxgIFDOT7U/edit#gid=0'
            let expected = 'https://docs.google.com/spreadsheets/d/1z4f_-m8mqp2-yR0Rx-R4xDA_cVKCW1Bd5KxgIFDOT7U/pub?output=csv'
            expect(DataFactory.getCSVURL({ data: { url: url } })).to.eq(expected)
        })
        it('should handle the proxy setting', () => {
            let url = 'https://docs.google.com/spreadsheets/d/1z4f_-m8mqp2-yR0Rx-R4xDA_cVKCW1Bd5KxgIFDOT7U/edit#gid=0'
            let expected = 'http://localhost:5000/proxy/https://docs.google.com/spreadsheets/d/1z4f_-m8mqp2-yR0Rx-R4xDA_cVKCW1Bd5KxgIFDOT7U/pub?output=csv'
            expect(DataFactory.getCSVURL({
                data: {
                    url: url,
                },
                proxy: 'http://localhost:5000/proxy/'
            })).to.eq(expected)
        })
    })

    describe('blank object testing', () => {
        it('should return true if all values are empty string', () => {
            let test = {
                a: '',
                b: '',
                c: '',
                d: ''
            }
            expect(isBlankRow(test)).to.be.true
        })

        it('should return false if any values are not empty string', () => {
            let test = {
                a: 'foo',
                b: '',
                c: '',
                d: ''
            }
            expect(isBlankRow(test)).to.be.false
        })


    })

    // describe('header testing', () => {
    //     it('should strip junk from column headers', () => {
    //         return dataFactoryInstance.fetchSheetData(config).then((result) => {
    //             let first_row = result[0]
    //             expect(first_row).to.eq({
    //                 'Date': '1/31/80',
    //                 'usunemploymentrate': '1'
    //             })
    //         })
    //     })
    // })
})