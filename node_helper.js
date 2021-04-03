/* Magic Mirror
 * Node Helper: MMM-Covid-HR
 *
 * By Lolo
 * MIT Licensed.
 */
const NodeHelper = require('node_helper');
const request = require('request');
var Promise = require("promise");
var self;

module.exports = NodeHelper.create({

    start: function () {
        self = this;
        console.log("Starting node_helper for: " + this.name);
    },

    getCovidLocal: function (regionSelector,urlLocal,moduleName) {
        return new Promise(function(resolve, reject) {
            var self = this;
            var url = urlLocal;
            request({
                url: url,
                method: 'GET'
            }, (error, response, body) => {
                if (!error && response.statusCode == 200) {					
                    var result = JSON.parse(body).slice(0, 2);
                    localData = [];
                    let date = result[0].Datum;					
                    var selectIndex = regionSelector.map(function (ele) {
                        var index = result[0].PodaciDetaljno.reduce((r, o, i) => (o.Zupanija === ele && r.push(i), r), []);
                        var covidLocalData = {
                            date,
                            region: result[0].PodaciDetaljno[index].Zupanija,
                            cases: result[0].PodaciDetaljno[index].broj_zarazenih,
                            diffCases: result[0].PodaciDetaljno[index].broj_zarazenih - result[1].PodaciDetaljno[index].broj_zarazenih,
                            deaths: result[0].PodaciDetaljno[index].broj_umrlih,
                            diffDeaths: result[0].PodaciDetaljno[index].broj_umrlih - result[1].PodaciDetaljno[index].broj_umrlih,
                            active: result[0].PodaciDetaljno[index].broj_aktivni,
                            diffActive: result[0].PodaciDetaljno[index].broj_aktivni - result[1].PodaciDetaljno[index].broj_aktivni,
                            recovered: result[0].PodaciDetaljno[index].broj_zarazenih - result[0].PodaciDetaljno[index].broj_umrlih - result[0].PodaciDetaljno[index].broj_aktivni,
                            diffRecovered: (result[0].PodaciDetaljno[index].broj_zarazenih - result[0].PodaciDetaljno[index].broj_umrlih - result[0].PodaciDetaljno[index].broj_aktivni) - (result[1].PodaciDetaljno[index].broj_zarazenih - result[1].PodaciDetaljno[index].broj_umrlih - result[1].PodaciDetaljno[index].broj_aktivni)
                        }
                        localData.push(covidLocalData);
                    });
					//console.log(moduleName +" localData: ",localData);
					resolve(localData)
					
                }  if (error) {
					//err = new Error(moduleName + " getCovidLocal - Unexpected status code: "+ response.statusCode + error);
                    return reject(moduleName + " getCovidLocal: " + error);
                }
            });
			
        });
    },

    getCovidGlobal: function (urlGlobal,moduleName) {
        return new Promise(function(resolve, reject) {
            var self = this;
            var url = urlGlobal;
            request({
                url: url,
                method: 'GET'
            }, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    console.log(response.statusCode);
					var result = JSON.parse(body).slice(0, 2);
                    globalData = [];
                    let world = {
                        date: result[0].Datum,
                        region: "WORLD",
                        cases: result[0].SlucajeviSvijet,
                        diffCases: result[0].SlucajeviSvijet - result[1].SlucajeviSvijet,
                        deaths: result[0].UmrliSvijet,
                        diffDeaths: result[0].UmrliSvijet - result[1].UmrliSvijet,
                        recovered: result[0].IzlijeceniSvijet,
                        diffRecovered: result[0].IzlijeceniSvijet - result[1].IzlijeceniSvijet,
                        active: result[0].SlucajeviSvijet - result[0].UmrliSvijet - result[0].IzlijeceniSvijet,
                        diffActive: (result[0].SlucajeviSvijet - result[0].UmrliSvijet - result[0].IzlijeceniSvijet) - (result[1].SlucajeviSvijet - result[1].UmrliSvijet - result[1].IzlijeceniSvijet)
                    };
                    let hrvatska = {
                        date: result[0].Datum,
                        region: "Hrvatska",
                        cases: result[0].SlucajeviHrvatska,
                        diffCases: result[0].SlucajeviHrvatska - result[1].SlucajeviHrvatska,
                        deaths: result[0].UmrliHrvatska,
                        diffDeaths: result[0].UmrliHrvatska - result[1].UmrliHrvatska,
                        recovered: result[0].IzlijeceniHrvatska,
                        diffRecovered: result[0].IzlijeceniHrvatska - result[1].IzlijeceniHrvatska,
                        active: result[0].SlucajeviHrvatska - result[0].UmrliHrvatska - result[0].IzlijeceniHrvatska,
                        diffActive: (result[0].SlucajeviHrvatska - result[0].UmrliHrvatska - result[0].IzlijeceniHrvatska) - (result[1].SlucajeviHrvatska - result[1].UmrliHrvatska - result[1].IzlijeceniHrvatska)
                    };
                    globalData.push(world, hrvatska);
                    // console.log(moduleName +" globalData: ",globalData);
					resolve(globalData)                 
                }  if (error){
                    return reject(moduleName + " getCovidGlobal: " + error);
                }
            });
        });
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === 'GET_COVID_DATA') {
			var moduleName=this.name;
            editData(payload,moduleName);
        }
    }
});

async function editData(object,moduleName) {
    try {
        var newglobalData = await self.getCovidGlobal(object.urlGlobal,moduleName).then(function (globalData) {
					//console.log(moduleName +" globalData: ",globalData);
				}, function (errorGlobal) {
					console.error(errorGlobal);
					console.log(errorGlobal);
			});		
		var newlocalData = await self.getCovidLocal(object.zupanijaSelector,object.urlLocal,moduleName).then(function (localData) {
					//console.log(moduleName +" localData: ",localData);
				}, function (errorLocal) {
					console.error(errorLocal);
					console.log(errorLocal);
			});
        var covidData = globalData.concat(localData);
        self.sendSocketNotification("COVID_RESULT",JSON.parse(JSON.stringify(covidData)) );//JSON.stringify(covidData)
    } catch (error) {
        console.error("test " + moduleName + ' editData(): ' + error);
    }
};
