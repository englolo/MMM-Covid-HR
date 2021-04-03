/* global Module */

/* Magic Mirror
 * Module: MMM-Covid-HR
 *
 * By
 * MIT Licensed.
 */

Module.register("MMM-Covid-HR", {
    defaults: {

        rotateInterval: 10 * 1000,
        initialLoadDelay: 0, //4250
        animationSpeed: 3000,
        updateInterval: 6 * 60 * 60 * 1000, 
        urlLocal: "https://www.koronavirus.hr/json/?action=po_danima_zupanijama",
        urlGlobal: "https://www.koronavirus.hr/json/?action=podaci",
        regionSelector: ["Bjelovarsko-bilogorska", "Brodsko-posavska", "Dubrovačko-neretvanska", "Grad Zagreb", "Istarska", "Karlovačka", "Koprivničko-križevačka", "Krapinsko-zagorska županija", "Ličko-senjska", "Međimurska", "Osječko-baranjska", "Požeško-slavonska", "Primorsko-goranska", "Šibensko-kninska", "Sisačko-moslavačka", "Splitsko-dalmatinska", "Varaždinska", "Virovitičko-podravska", "Vukovarsko-srijemska", "Zadarska", "Zagrebačka "],
        fadePoint: 0.2,
        fade: true,
        decimal: 6,
        mode: "carousel",
        carousel: true,

    },

    start: function () {
        Log.info("Starting module: " + this.name);
        requiresVersion: "2.1.0",
        this.covidDataRecived = [];
        this.rotateInterval = null;
        this.activeItem = 0;
        this.scheduleUpdate();
        this.rotate = null;
        this.firstLoad = true;
    },
    getScripts: function () {
        return ["moment.js"];
    },
    // getStyles: function () {
    // return ["MMM-Covid-HR.css"];
    // },

    // getTranslations: function () {
    // return {
    // en: "translations/en.json",
    // hr: "translations/hr.json"
    // };
    // },

    diffCases: function (numberToFix) {
        if (numberToFix > 0) {
            number = "▴" + numberToFix;
            style = "red";
            return number;
        } else if (numberToFix === 0) {
            number = numberToFix
                return number;
        }
    },

    diffActive: function (numberToFix) {
        if (numberToFix > 0) {
            number = "▴" + numberToFix
                return number;
        } else if (numberToFix < 0) {
            number = "▾" + Math.abs(numberToFix)
                return number;
        } else {
            number = numberToFix
                return number;
        }
    },

    diffDeaths: function (numberToFix) {
        if (numberToFix > 0) {
            number = "▴" + numberToFix
                return number;
        } else if (numberToFix === 0) {
            number = numberToFix
                return number;
        }
    },

    diffRecovered: function (numberToFix) {
        if (numberToFix > 0) {
            number = "▴" + numberToFix
                return number;
        } else if (numberToFix === 0) {
            number = numberToFix
                return number;
        }
    },

    changeColorCases: function (val) {
        if (val > 0) {
            color = "red";
            return color
        } else { //if (val = 0)
            color = "green";
            return color
        }
    },

    changeColorActive: function (val) {
        if (val > 0) {
            color = "red";
            return color
        } else {
            color = "green";
            return color
        }
    },

    changeColorDeaths: function (val) {
        if (val > 0) {
            color = "red";
            return color
        } else { //if (val = 0)
            color = "green";
            return color
        }
    },
    changeColorRecovered: function (val) {
        if (val < 0) {
            color = "red";
            return color
        } else { //if (val < 0)
            color = "green";
            return color
        }
    },

    setCarousel: function () {

        var i = Object.keys(this.covidDataRecived);
        if (i.length > 0) {
            if (this.activeItem >= i.length) {
                this.activeItem = 0;
            }

            var covidData = this.covidDataRecived[i[this.activeItem]];

            var tableWrapper = document.createElement("div");
            tableWrapper.style.display = "inline-table";

            var header = document.createElement("header");
            header.style.display = "flex";
            header.style.justifyContent = "space-between";

            var region = document.createElement("span");
            region.innerHTML = covidData.region;
            region.style.paddingRight = "10px"
            var dateSpan = document.createElement("span");
            dateSpan.innerHTML = moment(covidData.date).format('LLL'); // covidData.datum.moment.locale()  /// moment(covidData.datum).format('LLL')

            header.appendChild(region);
            header.appendChild(dateSpan);
            tableWrapper.appendChild(header);

            var table = document.createElement('tr');
            table.classList.add("xsmall", "normal");
            table.style.display = "flex";
            table.style.justifyContent = "space-between";

            /*   confirmed                          */
            var confirmedTd = document.createElement('td');
            confirmedTd.style.paddingRight = "15px";

            var confirmed = document.createElement('div');
            confirmed.innerHTML = "Zaraženi"; //.toUpperCase()

            var totalconfirmed = document.createElement('div');
            totalconfirmed.innerHTML = covidData.cases;

            var newconfirmed = document.createElement('div');
            newconfirmed.innerHTML = this.diffCases(covidData.diffCases);
            newconfirmed.style.color = this.changeColorCases(covidData.diffCases);
            newconfirmed.style.fontSize = "small";

            confirmedTd.appendChild(confirmed);
            confirmedTd.appendChild(totalconfirmed);
            confirmedTd.appendChild(newconfirmed);
            table.appendChild(confirmedTd);

            /*   active                          */
            var activeTd = document.createElement('td');
            activeTd.style.paddingRight = "15px";

            var active = document.createElement('div');
            active.innerHTML = "Aktivni";

            var totalactive = document.createElement('div');
            totalactive.innerHTML = covidData.active;

            var newactive = document.createElement('div');
            newactive.innerHTML = this.diffActive(covidData.diffActive);
            newactive.style.color = this.changeColorActive(covidData.diffActive);
            newactive.style.fontSize = "small";

            activeTd.appendChild(active);
            activeTd.appendChild(totalactive);
            activeTd.appendChild(newactive);
            table.appendChild(activeTd);

            /*      deaths                       */
            var deathsTd = document.createElement('td');
            deathsTd.style.paddingRight = "15px";

            var deaths = document.createElement('div');
            deaths.innerHTML = "Umrli";

            var totaldeaths = document.createElement('div');
            totaldeaths.innerHTML = covidData.deaths;

            var newdeaths = document.createElement('div');
            newdeaths.innerHTML = this.diffDeaths(covidData.diffDeaths);
            newdeaths.style.color = this.changeColorDeaths(covidData.diffDeaths);
            newdeaths.style.fontSize = "small";

            deathsTd.appendChild(deaths);
            deathsTd.appendChild(totaldeaths);
            deathsTd.appendChild(newdeaths);
            table.appendChild(deathsTd);

            /*    recovered                         */
            var recoveredTd = document.createElement('td');

            var recovered = document.createElement('div');
            recovered.innerHTML = "Izlječeni";

            var totalrecovered = document.createElement('div');
            totalrecovered.innerHTML = covidData.recovered;

            var newrecovered = document.createElement('div');
            newrecovered.innerHTML = this.diffRecovered(covidData.diffRecovered);
            newrecovered.style.color = this.changeColorRecovered(covidData.diffRecovered);
            newrecovered.style.fontSize = "small";

            recoveredTd.appendChild(recovered);
            recoveredTd.appendChild(totalrecovered);
            recoveredTd.appendChild(newrecovered);
            table.appendChild(recoveredTd);

            tableWrapper.appendChild(table);
        }
        return tableWrapper;
    },

    setTable: function () {

        var tableWrapper = document.createElement("div")

            var header = document.createElement("header");
        header.innerHTML = "COVID TABLE"; // treba promjeniti
        tableWrapper.appendChild(header);

        var startFade = this.covidDataRecived.length * this.config.fadePoint;
        var fadeSteps = this.covidDataRecived.length - startFade;
        var currentFadeStep = 0;
        var mainTable = document.createElement('table');

        var i = Object.keys(this.covidDataRecived);
        if (i.length > 0) {
            for (i = 0; i < this.covidDataRecived.length; i++) {

                var mainTr = document.createElement('tr');
                mainTr.className = 'mainTr';
                if (this.config.fade) {
                    if (i >= startFade) {
                        currentFadeStep = i - startFade;
                    }
                }
                mainTr.style.opacity = 1 - (1 / fadeSteps) * currentFadeStep;

                // var flagTd = document.createElement('td');
                // flagTd.className = "flagTd";
                // var flag = document.createElement('i');
                // flag.className = this.HNB[i].valuta;
                // flagTd.appendChild(flag);
                // mainTr.appendChild(flagTd);

                // var valueTd = document.createElement('td');
                // valueTd.className = 'valueTd';
                // var value = document.createElement('span');
                // value.innerHTML = this.translate("FOR") + this.HNB[i].jedinica + " " + this.HNB[i].valuta;
                // valueTd.appendChild(value);
                // mainTr.appendChild(valueTd);

                // var buyingTd = document.createElement('td');
                // buyingTd.className = 'buyingTd';
                // buyingTd.innerHTML = parseFloat(this.HNB[i].kupovni_tecaj.replace(",", ".")).toFixed(this.config.decimal) + " HRK";
                // mainTr.appendChild(buyingTd);

                // var middleTd = document.createElement('td');
                // middleTd.className = 'middleTd';
                // middleTd.innerHTML = parseFloat(this.HNB[i].srednji_tecaj.replace(",", ".")).toFixed(this.config.decimal) + " HRK";
                // mainTr.appendChild(middleTd);

                // var sellingTd = document.createElement('td');
                // sellingTd.className = 'sellingTd';
                // sellingTd.innerHTML = parseFloat(this.HNB[i].prodajni_tecaj.replace(",", ".")).toFixed(this.config.decimal) + " HRK";
                // mainTr.appendChild(sellingTd);

                mainTable.appendChild(mainTr);
                tableWrapper.appendChild(mainTr);
            }
        }
        return tableWrapper;
    },

    getDom: function () {
        var wrapper = document.createElement("div");
        //wrapper.className = "small"
        //wrapper.classList.add("inline-block");
        wrapper.className = "wrapper";

        if (!this.loaded) {
            wrapper.innerHTML = "LOADING";
            return wrapper;
        }

        if (this.loaded) {
            if (this.config.mode == "table") {

                wrapper.appendChild(this.setTable());
            }

            if (this.config.mode == "carousel") {
                wrapper.appendChild(this.setCarousel());
            }
        }
        return wrapper;
    },

    resume: function () {
        if (this.config.mode === "carousel" && this.config.carousel) {
            this.activeItem++;
            //console.log("@resume", this.lockStrings, this.hidden, this.activeItem)

            if (!this.animation) {
                this.updateDom();
            } else {
                this.updateDom(this.config.animationSpeed);
            }
        }
    },

    scheduleRotate: function () {
        this.rotateInterval = setInterval(() => {
            this.activeItem++;
            this.updateDom(this.config.animationSpeed);
        }, this.config.rotateInterval);
    },

    scheduleUpdate: function () {
        setInterval(() => {
            this.getCovid();
        }, this.config.updateInterval);
        this.getCovid(this.config.initialLoadDelay);
    },

    getCovid: function () {
        this.sendSocketNotification('GET_COVID_DATA', this.config);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "COVID_RESULT") {
            this.covidDataRecived = payload;
            this.loaded = true;

            //console.log(notification, payload);

            if (this.config.mode === "carousel" && !this.config.carousel) {
                if (this.rotateInterval == null) {
                    this.scheduleRotate();
                }
                this.updateDom(this.config.animationSpeed); //this.updateDom(this.config.initialLoadDelay);
            }
            if (this.config.carousel && this.firstLoad) {
                this.firstLoad = false;
                this.updateDom(this.config.animationSpeed);
            }
        }

    },
});
