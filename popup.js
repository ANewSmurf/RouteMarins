/************
 * popup.js *
 ************/
const builder = require("xmlbuilder"),
    moment = require("moment-timezone");

var points = [];

const atwaTimeWindow = 120,
      atwaMaxTwaDif = 11,
      atwaMaxAverageDif = 2.5,
      acogTimeWindow = 120,
      acogMaxTwaDif = 6,
      acogMaxAverageDif = 3.5;

function getRaceid(value) {
    var raceid ;
    switch (value.trim().substring(0,4)) {
        case "Vend": // Vendée Globe
          raceid="440";
          break;
        case "Sout": // South China Sea Pressure
          raceid="849";
          break;
        case "Jule": // Jules Verne Trophy":
          raceid="441";
          break;
        case "Tara": //Tara Ocean xxx
        case "Puer": //Tara Ocean xxx
        case "Iqui": //Tara Ocean xxx
        case "Valp": //Tara Ocean xxx
        case "Pana": //Tara Ocean xxx
          raceid="470";
          break;
        case "Cari": // Caribbean 600 (471)
          raceid="471";
          break;
        case "La T": // La Transat en double (472)
          raceid="472";
          break;
        case "Norm": // Normandy channel Race (473)
          raceid="473";
          break;
        case "Solo": // Solo Maitre Coq (474)
          raceid="474";
          break;
        case "Olym": // Course olympique (476)
          raceid="476";
          break;
        case "Nord": // Nord Stream (482)
          raceid="482";
          break;
        case "LA -": // Los Angeles - Honolulu (483)
          raceid="483";
          break;
        case "Med ": // Med Odissey TAG HEUER VELA CUP (485)
          raceid="485";
          break;
        case "Atla": // Atlantique record (487)
          raceid="487";
          break;
    }
    return raceid;
  }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// CREATE CELLS AND STYLING
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createCell(value, row) {
    var cell = document.createElement('td');
    cell.innerHTML = value;
    row.appendChild(cell);
}

function createCellWindy(value, el, row) {
  var cell = document.createElement('td');
  // url model is https://www.windy.com/?gfs,2021-02-18-22,45.599,-10.867,5,i:pressure,d:picker
  var url = "https://www.windy.com/?gfs," + el.date + "-" + el.time.substring(0,2) + ","+ el.latitude.toFixed(3) + "," + el.longitude.toFixed(3) + ",5,i:pressure,d:picker";
  cell.innerHTML = '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + value + '</a>';
  cell.title = 'Click to access Windy\'s weather forecast site with correct time, position and prevision model';
  row.appendChild(cell);
}

function createCellPolar(value, el, row) {
  var cell = document.createElement('td');
  var raceid = typeof el.raceId === "string" && /^\d+\.\d+$/.test(el.raceId)
    ? el.raceId
    : undefined;
  if (!raceid) {
    var legacyRaceid = getRaceid(el.race);
    raceid = legacyRaceid ? legacyRaceid + ".1" : undefined;
  }
  var ltwa = el.twa.replace(/°/g,'').replace(/-/g,'').trim();
  var ltws = el.tws.replace(/kt/g,'').trim();
  if (!raceid) {
    cell.textContent = value;
    cell.title = 'Polar unavailable: unknown race ID';
    row.appendChild(cell);
    return;
  }
  // url model is http://toxcct.free.fr/polars/?race_id=440.1&tws=7.5&twa=105&utm_source=VRDashboard
  var url = "https://vro.civis.net/polars/?race_id=" + encodeURIComponent(raceid) + "&tws=" + encodeURIComponent(ltws) + "&twa=" + encodeURIComponent(ltwa) + "&utm_source=RouteMarins";
  cell.innerHTML = '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + value + '</a>';
  cell.title = 'Click to access LSV ToxCCT\'s polar site with correct boat, TWS and TWA';
  row.appendChild(cell);
}

function ttwStyling(value, cell) {
    cell.align = "left";
    cell.innerHTML = value;
    cell.title = "Time to waypoint from now in hours:minutes";
}

function dtwStyling(value, cell) {
    cell.align = "left";
    cell.innerHTML = value;
}

function dtgStyling(value, cell) {
    cell.align = "left";
    cell.innerHTML = value;
}

function twaStyling(value, cell) {
    var twa_bd = value.replace("\u00B0", "");
    if (twa_bd >= 0) {
        cell.style.color = "#00A000";
        cell.title = 'Starbord - Tribord';
      } else {
        cell.style.color = "#FF0000";
        cell.title = 'Port - Babord';
    }
    cell.innerHTML = Math.abs(twa_bd) + "\u00B0";
}

function rotStyling(value, cell) {
  var rot = value;
  if (rot >= 5) {
    cell.style.backgroundColor = "#00e200";
    cell.title = "Wind rotation is more than 5°/hour to the right";
  } else if (rot <= -5) {
    cell.style.color = "#FFFFFF";
    cell.style.backgroundColor = "#ff0000";
    cell.title = "Wind rotation is more than 5°/hour to the left";
  } else {
    cell.title = "Wind rotation in °/hour";
  }
  cell.innerHTML = rot ;
}

function cogStyling(value, cell) {
    //cell.style.color = "#0000FF";
    cell.innerHTML = value;
}

function sailStyling(value, cell) {
    switch (value.trim()) {
        case "Jib":
          cell.style.color = "#FFFFFF";
          cell.style.backgroundColor = "#ff00c7"; // purple
          cell.title = "Jib";
          break;
        case "LJ":
          cell.style.color = "#FFFFFF";
          cell.style.backgroundColor = "#F67876"; // light red
          cell.title = "Light Jib";
          break;
        case "Stay":
          cell.style.color = "#FFFFFF";
          cell.style.backgroundColor = "#0000FF"; // strong blue
          cell.title = "Stay sail";
          break;
        case "C0":
          cell.style.color = "#FFFFFF";
          cell.style.backgroundColor = "#00A000"; // strong green
          cell.title = "Code 0";
          break;
        case "HG":
          cell.style.color = "#FFFFFF";
          cell.style.backgroundColor = "#B00000"; // strong red
          cell.title = "Heavy Genaker";
          break;
        case "LG":
          cell.style.color = "#FFFFFF";
          cell.style.backgroundColor = "#D77900"; // light orange
          cell.title = "Light Genaker";
          break;
        case "Spi":
          cell.style.color = "#FFFFFF";
          cell.style.backgroundColor = "#00FF00"; // green
          cell.title = "Spinaker";
          break;

    }
    cell.innerHTML = value;
}

function sogStyling(twsValue, twaValue, value, cell) {
    var twsFoil = twsValue.replace(" kt", ""),
        twaFoil= twaValue.replace("\u00B0", "");
    if (twsFoil >= 11.1 && twsFoil <= 39.9 && Math.abs(twaFoil) >= 71 && Math.abs(twaFoil) <= 169) {
        cell.style.backgroundColor = "#D77900";
        //cell.style.backgroundColor = "#8470FF";
        cell.style.color = "#FFFFFF";
        cell.title = "Foils are on";
    } else {
        cell.title = "Foils are off";
    }
    cell.innerHTML = value;
}

function atwaStyling(element, cell) {
    if (element.atwa_average == undefined ) {
      cell.style.color = "#000000";
      cell.innerHTML = '-';
      return;
    }
    cell.innerHTML = Math.abs(element.atwa_average) + "\u00B0";
    cell.title = "Averaged on a \u00B12h window across "+ (1+element.atwa_nb_before + element.atwa_nb_after) + " values, including:\n - "+ element.atwa_nb_before + " twa values before\n - " + element.atwa_nb_after + " twa values after";
    if (element.atwa_average >= 0) { // tribord - starbord
      if (element.atwa_restart) {
        cell.style.backgroundColor = "#00e200";
        cell.title = "Average is away from previous value by more than "+ atwaMaxAverageDif +"° - reinitialising average calculation\n" + cell.title;
      } else {
        cell.style.color = "#00A000";
      }
    } else { // babord - port
      if (element.atwa_restart) {
        cell.style.backgroundColor = "#FF0000";
        cell.style.color = "#FFFFFF";
        cell.title = "Average is away from previous value by more than "+ atwaMaxAverageDif +"° - reinitialising average calculation\n" + cell.title;
      } else {
        cell.style.color = "#FF0000";
      }
    }
}

function acogStyling(element, cell) {
    if (element.acog_average !== "-") {
        cell.innerHTML = element.acog_average + "\u00B0";
        cell.title = "Averaged on a \u00B12h window across "+ (1+element.acog_nb_before + element.acog_nb_after) + " values, including:\n - "+ element.acog_nb_before + " twa values before\n - " + element.acog_nb_after + " twa values after";
        if (element.acog_restart) {
          cell.style.backgroundColor = "#cccccc";
          cell.title = "Average is away from previous value by more than "+ acogMaxAverageDif +"° - reinitialising average calculation\n" + cell.title;
        }
      } else {
        cell.style.color = "#000000";
        cell.innerHTML = "-";
    }
}

function createCellWithCustomStyling(value, row, customStyling) {
    var cell = document.createElement('td');
    customStyling(value, cell);
    row.appendChild(cell);
}

function createCellWithCustomStyling2(twsValue, twaValue, value, row, customStyling) {
    var cell = document.createElement('td');
    customStyling(twsValue, twaValue, value, cell);
    row.appendChild(cell);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// CORE FUNCTIONS
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function space(value) {
    if (value < 10) {
        value = " " + value;
    }
    return value;
}

function zero(value) {
    if (value < 10) {
        value = "0" + value;
    }
    return value;
}

function dmsConv(latitude, longitude) {
    var latAbs = Math.abs(latitude),
        latDeg = Math.trunc(latAbs),
        latMin = Math.trunc((latAbs - latDeg) * 60),
        latSec = Math.trunc((((latAbs - latDeg) * 60) - latMin) * 60),
        latCard = (latitude >= 0) ? "N" : "S",
        lonAbs = Math.abs(longitude),
        lonDeg = Math.trunc(lonAbs),
        lonMin = Math.trunc((lonAbs - lonDeg) * 60),
        lonSec = Math.trunc((((lonAbs - lonDeg) * 60) - lonMin) * 60),
        lonCard = (longitude >= 0) ? "E" : "W";
    return zero(latDeg) + "\u00B0" + zero(latMin) + "\u0027" + zero(latSec) + "\u0022" + latCard + " " + zero(lonDeg) + "\u00B0" + zero(lonMin) + "\u0027" + zero(lonSec) + "\u0022" + lonCard;
}

Math.radians = function (degrees) {
  return degrees * Math.PI / 180;
},
Math.degrees = function (radians) {
  return radians * 180 / Math.PI;
};

function reinitializeDisplay() {
    document.getElementById("pointsTable").innerHTML = "";
}

function TzToLocal(date, time, timezone) {
    var tzGuess = moment.tz.guess();
    if (timezone === "CET" || timezone === "CEST") {
        var CetOrCestToUtc = moment.tz(date + " " + time, "Europe/Paris").utc(),
            localDateTz = moment.utc(CetOrCestToUtc).tz(tzGuess);
    } else if (timezone === "UTC") {
        var localDateTz = moment.utc(date + " " + time).tz(tzGuess);
    }
    var offset = localDateTz.utcOffset(),
        absOffset = Math.abs(offset),
        sign = (offset > 0) ? "+" : "-",
        hOffset = Math.trunc(absOffset / 60),
        HoursOffset = (hOffset === 0) ? "\u00b1" + "0" : sign + hOffset,
        mOffset = absOffset % 60,
        HoursMinutesOffset = (mOffset === 0) ? HoursOffset : sign + hOffset + ":" + mOffset,
        formatDate = localDateTz.format("ddd DD"),
        formatTime = localDateTz.format("HH:mm"),
        formatTimeZone = "UTC" + HoursMinutesOffset;
    return [formatDate, formatTime, formatTimeZone];
}

function refreshFixedTable() {
    var fixedTableBody = document.getElementById("pointsTable2");
    if (fixedTableBody) {
        fixedTableBody.innerHTML = document.getElementById("pointsTable").innerHTML;
    }
    if (document.querySelector(".theader-fixed") && typeof table_thead_fixed_resize === "function") {
        table_thead_fixed_resize();
    }
}

function displayTable(localTime) {
    points.forEach(function (element) {
        var row = document.createElement('tr');
        document.getElementById("pointsTable").appendChild(row);
        if (localTime) {
            var localTZ = TzToLocal(element.date, element.time, element.timezone);
            createCell(localTZ[0], row);
            createCell(localTZ[1], row);
      //      createCell(localTZ[2], row);
        } else {
            createCell(element.date, row);
            createCell(element.time, row);
      //      createCell(element.timezone, row);
        }
        var position = dmsConv(element.latitude, element.longitude);
        createCellWindy(position, element, row);
        createCellWithCustomStyling(element.ttw, row, ttwStyling);
        createCell(element.twd, row);
        createCellWithCustomStyling(element.rotation, row, rotStyling);
        createCellPolar(element.tws, element, row);
        createCellWithCustomStyling2(element.tws, element.twa, element.sog, row, sogStyling);
        createCellWithCustomStyling(element.sail, row, sailStyling);
        createCellWithCustomStyling(element.twa, row, twaStyling);
        createCellWithCustomStyling(element, row, atwaStyling);
        createCellWithCustomStyling(element.cog, row, cogStyling);
        createCellWithCustomStyling(element, row, acogStyling);
        //createCellWithCustomStyling(element.dtw, row, dtwStyling);
        //createCellWithCustomStyling(element.dtg, row, dtgStyling);
        var manifest = chrome.runtime.getManifest();
        document.getElementById("version").innerHTML = manifest.version;
    });
    refreshFixedTable();
}

var displayLocal = function () {
    reinitializeDisplay();
    if (document.getElementById("localtime").checked) {
        chrome.storage.local.set({
            "localTime": true
        });
        displayTable(true);
    } else {
        chrome.storage.local.set({
            "localTime": false
        });
        displayTable(false);
    }
};
document.getElementById("localtime").addEventListener("change", displayLocal);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Download GPX
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function displayGeneratedContent(content, copyToClipboard) {
    var output = document.getElementById("gpxKmlOutput");

    output.value = content;

    if (copyToClipboard) {
        output.select();
        document.execCommand("copy");
    }
}

function getRouteDownloadName(extension) {
    var raceName = points[0]?.race || "route";

    var safeRaceName = raceName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

    var routeDate = (points[0]?.date || "")
        .replace(/[^0-9-]/g, "");

    var nameParts = [
        "RouteMarins",
        safeRaceName || "route"
    ];

    if (routeDate) {
        nameParts.push(routeDate);
    }

    return nameParts.join("_") + "." + extension;
}

function downloadGeneratedFile(content, extension, mimeType) {
    var blob = new Blob(
        [content],
        { type: mimeType }
    );

    var objectUrl = URL.createObjectURL(blob);

    chrome.downloads.download({
        url: objectUrl,
        filename: getRouteDownloadName(extension),
        saveAs: true,
        conflictAction: "uniquify"
    }, function () {
        if (chrome.runtime.lastError) {
            console.error(
                "Erreur de téléchargement :",
                chrome.runtime.lastError.message
            );

            document.getElementById("gpxKmlOutput").value =
                "Erreur de téléchargement : "
                + chrome.runtime.lastError.message;
        }

        setTimeout(function () {
            URL.revokeObjectURL(objectUrl);
        }, 10000);
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Export GPX
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var exportGpx = function (copyToClipboard) {
    let xml = builder.create("gpx");
    xml.att('xmlns', "http://www.topografix.com/GPX/1/1"),
    xml.att('xmlns:xsi', "http://www.w3.org/2001/XMLSchema-instance"),
    xml.att('xsi:schemaLocation', "http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd"),
    xml.att('version', "1.1"),
    xml.att('creator', "RouteMarins");
    let metadata = xml.ele('metadata');
    let link = metadata.ele('link', { href: 'https://chromewebstore.google.com/detail/routemarins/imipnigmdedacnmjnkoepkigpicdjmje' });
    link.ele('text', 'RouteMarins');
    metadata.ele('time', new Date().toISOString());
    // 2. --- AJOUT DES WAYPOINTS (<wpt>) POUR CHAQUE POINT ---
    for (let point of points) {
        if (point.latitude !== undefined && point.longitude !== undefined) {
            // Création du waypoint racine avec ses attributs lat et lon
            let waypoint = xml.ele('wpt', {
                lat: point.latitude,
                lon: point.longitude
            });

            // Formatage de la date en ISO (Z)
            let isoDate = "";
            if ((point.timezone === "CET") || (point.timezone === "CEST")) {
                isoDate = moment.tz(point.date + " " + point.time, "Europe/Paris").toISOString();
            } else if (point.timezone === "UTC") {
                isoDate = moment.utc(point.date + " " + point.time).toISOString();
            }

            // On peut optionnellement forcer le format court sans les secondes "YYYY-MM-DDTHH:mmZ" si besoin :
            // isoDate = moment(isoDate).format("YYYY-MM-DDTHH:mm[Z]");

            waypoint.ele('time', isoDate);
            waypoint.ele('name', isoDate); // Le nom reprend la même date dans votre exemple

            // Construction de la chaîne de description dynamique
            // Adaptez les propriétés (point.hdog, point.twa, etc.) selon la structure exacte de vos objets
            let description = `HDG:${point.cog} TWA:${point.twa} ${point.sail} SOG:${point.sog} TWS:${point.tws}`;
            waypoint.ele('desc', description);
        }
    }
/*
    let route = xml.ele('rte');
    route.ele('name', "RouteMarins " + points[0].race);
    for (point of points) {
        if (point.latitude !== undefined && point.longitude !== undefined) {
            let routePoint = route.ele('rtept', {
                lat: point.latitude,
                lon: point.longitude
            });
            if ((point.timezone === "CET") || (point.timezone === "CEST")) {
                routePoint.ele('time', moment.tz(point.date + " " + point.time, "Europe/Paris").toISOString());
            } else if (point.timezone === "UTC") {
                routePoint.ele('time', moment.utc(point.date + " " + point.time).toISOString());
            }
            routePoint.ele('name', point.ttw);
        }
    }
*/
    let xmlString = xml.end({
        pretty: true
    });

    displayGeneratedContent(xmlString, copyToClipboard);

    return xmlString;
};

document.getElementById("gpxExport").addEventListener("click", function () {
    exportGpx(true);
});

document.getElementById("gpxDownload").addEventListener("click", function () {
    downloadGeneratedFile(exportGpx(false), "gpx", "application/gpx+xml;charset=utf-8");
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Export KML
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var exportkml = function (copyToClipboard) {
  let kml = builder.create("kml", {
    version: '1.0',
    encoding: 'UTF-8'
  });
  kml.att('xmlns', "http://www.opengis.net/kml/2.2"),
  kml.att('xmlns:vlm', "http://www.v-l-m.org"),
  kml.att('xmlns:gx', "http://www.google.com/kml/ext/2.2"),
  kml.att('creator', "RouteMarins");
  let doc = kml.ele('Document');
  var kmlStyle= {
    Style: [{
        '@id': "route_n",
        IconStyle: {
          scale: "0.5",
          color: "ff1427a5",
          Icon: { href: "https://www.webinage.fr/Placemark-32.png" },
          hotSpot: {"@x": "16", "@y": "1", "@xunits": "pixels", "@yunits": "pixels"}
          }
      },{
        '@id': "route_h",
        IconStyle: {
          scale: "0.5",
          color: "ff1427a5",
          Icon: { href: "https://www.webinage.fr/Placemark-32.png" },
          hotSpot: {"@x": "16", "@y": "1", "@xunits": "pixels", "@yunits": "pixels"}
          }
      },{
        '@id': "lineStyle",
        LineStyle: {
          color: "ff1427a5",
          width: "3"
          }
      }
    ],
    StyleMap:[{
      '@id': "route",
      Pair: [
        {key: "normal", styleUrl: "#route_n"},
        {key: "highlight", styleUrl: "#route_h"} ]
      }
    ]
  };
  doc.ele(kmlStyle);
  doc.ele({"name": "Trace RouteMarins"});
  let f1 = doc.ele('Folder');
  f1.ele('name', "RouteMarins " + points[0].race);
  let f2 = f1.ele('Folder');

  for (point of points) {
      if (point.latitude !== undefined && point.longitude !== undefined) {
          let placemark = f2.ele('Placemark');
          let timestamp = placemark.ele('TimeStamp');
          if ((point.timezone === "CET") || (point.timezone === "CEST")) {
            placemark.ele('name', moment.tz(point.date + " " + point.time, "Europe/Paris").format('DD MMM [-] HH:mm') + 'loc ('+ point.ttw + ')');
            timestamp.ele('when', moment.tz(point.date + " " + point.time, "Europe/Paris").toISOString());
          } else if (point.timezone === "UTC") {
            placemark.ele('name', moment.utc(point.date + " " + point.time).format('DD MMM [-] HH:mm') + 'utc ('+ point.ttw + ')');
            timestamp.ele('when', moment.utc(point.date + " " + point.time).toISOString());
          }
          let placepoint = placemark.ele('Point');
          placepoint.ele('coordinates', point.longitude + ',' + point.latitude + ',0.0');
          placemark.ele('description').cdata('<table>\
            <tr><td><strong>Lat - Lon:</strong> '+ dmsConv(point.latitude, point.longitude) + ' </td></tr>\
            <tr><td><strong>TWS:</strong> '+ point.tws +' </td><td><strong>TWD:</strong> '+ point.twd +' </td></tr>\
            <tr><td><strong>Wind rotation:</strong> '+ point.rotation +'°/h </td></tr>\
            <tr><td><strong>SOG:</strong> '+ point.sog +' </td><td><strong>COG:</strong> '+ point.cog +' </td></tr>\
            <tr><td><strong>TWA:</strong> '+ point.twa +' </td><td><strong>Sail:</strong> '+ point.sail +' </td></tr>\
            <tr></tr>\
            </table>');
          placemark.ele({'styleUrl': '#route'})
      }
  }
  let linePlacemark = f1.ele('Placemark');
  linePlacemark.ele({"name": "Path RouteMarins", "styleUrl": "#lineStyle"});
  lineString = linePlacemark.ele("LineString");
  lineString.ele({"tessellate": "1"});
  var coord = '';
  var times = '';
  for (point of points) {
      coord = (coord == '' ? '' : coord + ' \n') + point.longitude + ',' + point.latitude ;
      times = (times == '' ? '' : times + ' \n') + point.date + " " + point.time ;
    }
  lineString.ele('coordinates').text(coord);
  lineString.ele('TimeStamp').ele('when').text(times);

  let kmlString = kml.end({
    pretty: true
  });

  displayGeneratedContent(kmlString, copyToClipboard);

  return kmlString;
};

document.getElementById("kmlExport").addEventListener("click", function () {
  exportkml(true);
});

document.getElementById("kmlDownload").addEventListener("click", function () {
  downloadGeneratedFile(exportkml(false), "kml", "application/vnd.google-earth.kml+xml;charset=utf-8");
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Export TWA + avTWA + COG + avCOG
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var twaProg = function () {
  let nbRows = 2;
  let progOutput = document.getElementById("gpxKmlOutput");
  progOutput.value = 'now ' + points[0].twa + 'twa\n' ;
  // only display programmation for next 24h - no need beyond
  for (var i = 1; i < points.length && points[i].cur_ttw < 1440 ; i++ ) {
    if (points[i].twa !== points[i-1].twa) { // don't repeat same prog
        progOutput.value +=  (document.getElementById("localtime").checked ? TzToLocal(points[i].date, points[i].time, points[i].timezone)[1] : points[i].time ) + points[i].twa + 'twa\n' ;
        nbRows +=1;
    }
  }
  progOutput.setAttribute('rows', nbRows);
  progOutput.select();
  document.execCommand('copy');
};
document.getElementById("twaProg").addEventListener("click", twaProg);

var avTwaProg = function () {
  let nbRows = 2;
  let progOutput = document.getElementById("gpxKmlOutput");
  progOutput.value = 'now ' + points[0].atwa_average + '° avTwa\n' ;
  // only display programmation for next 24h - no need beyond
  for (var i = 1; i < points.length && points[i].cur_ttw < 1440 ; i++ ) {
    if (points[i].atwa_average !== points[i-1].atwa_average) { // don't repeat same prog
        progOutput.value +=  (document.getElementById("localtime").checked ? TzToLocal(points[i].date, points[i].time, points[i].timezone)[1] : points[i].time ) + ' '+ points[i].atwa_average + '° avTwa\n' ;
        nbRows +=1;
    }
  }
  progOutput.setAttribute('rows', nbRows);
  progOutput.select();
  document.execCommand('copy');
};
document.getElementById("avTwaProg").addEventListener("click", avTwaProg);

var cogProg = function () {
  let nbRows = 2;
  let progOutput = document.getElementById("gpxKmlOutput");
  progOutput.value = 'now ' + points[0].cog + 'cog\n' ;
  // only display programmation for next 24h - no need beyond
  for (var i = 1; i < points.length && points[i].cur_ttw < 1440 ; i++ ) {
    if (points[i].cog !== points[i-1].cog) { // don't repeat same prog
        progOutput.value +=  (document.getElementById("localtime").checked ? TzToLocal(points[i].date, points[i].time, points[i].timezone)[1] : points[i].time ) + points[i].cog + 'cog\n' ;
        nbRows +=1;
    }
  }
  progOutput.setAttribute('rows', nbRows);
  progOutput.select();
  document.execCommand('copy');
};
document.getElementById("cogProg").addEventListener("click", cogProg);

var avCogProg = function () {
  let nbRows = 2;
  let progOutput = document.getElementById("gpxKmlOutput");
  progOutput.value = 'now ' + points[0].acog_average + '° avCog\n' ;
  // only display programmation for next 24h - no need beyond
  for (var i = 1; i < points.length && points[i].cur_ttw < 1440 ; i++ ) {
    if (points[i].acog_average !== points[i-1].acog_average ) { // don't repeat same prog
        progOutput.value +=  (document.getElementById("localtime").checked ? TzToLocal(points[i].date, points[i].time, points[i].timezone)[1] : points[i].time ) + ' '+ points[i].acog_average + '° avCog\n' ;
        nbRows +=1;
    }
  }
  progOutput.setAttribute('rows', nbRows);
  progOutput.select();
  document.execCommand('copy');
};
document.getElementById("avCogProg").addEventListener("click", avCogProg);

reinitializeDisplay();
document.getElementById("version").textContent = chrome.runtime.getManifest().version;

function getMinutes(ttwCurr) {
  var ttwCurr = ttwCurr.match(/.*?([0-9]{1,3}):([0-9]{2})/),
      ttwHours = parseInt(ttwCurr[1], 10),
      ttwMinutes = parseInt(ttwCurr[2], 10);
      return ttwHours*60 + ttwMinutes ;
}

function showNoRoute(message) {
  reinitializeDisplay();
  var row = document.createElement("tr"),
      cell = document.createElement("td");
  cell.colSpan = 13;
  cell.textContent = message;
  row.appendChild(cell);
  document.getElementById("pointsTable").appendChild(row);

  ["gpxExport", "kmlExport", "gpxDownload", "kmlDownload", "twaProg", "avTwaProg", "cogProg", "avCogProg"].forEach(function (id) {
    document.getElementById(id).disabled = true;
  });
  refreshFixedTable();
}

function loadPointsForActiveTab() {
  chrome.storage.local.get("localTime", function (preference) {
    var displayLocalTime = preference.localTime === true;
    document.getElementById("localtime").checked = displayLocalTime;

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (chrome.runtime.lastError || tabs.length === 0 || tabs[0].id === undefined) {
        showNoRoute("Aucune route Zezo disponible dans cet onglet.");
        return;
      }

      var storageKey = "routePoints:" + tabs[0].id;
      chrome.storage.session.get(storageKey, function (result) {
        if (chrome.runtime.lastError) {
          showNoRoute("Impossible de charger les données de route.");
          return;
        }

        points = Array.isArray(result[storageKey]) ? result[storageKey] : [];
        if (points.length === 0) {
          showNoRoute("Aucun point de route trouvé. Rechargez la page Zezo puis réessayez.");
          return;
        }

        initializeRouteData(displayLocalTime);
      });
    });
  });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// MMAIN PROC
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function initializeRouteData(displayLocalTime) {
// basic infos
for (var i = 0; i < points.length ; i++) {
  points[i].index = i;
  points[i].cur_ttw = getMinutes(points[i].ttw);
  points[i].delta_ttw = ( i == 0 ? 0 : points[i].cur_ttw - points[i-1].cur_ttw ) ;
  points[i].cur_twa = parseInt(points[i].twa.replace(/°/g,"").trim(), 10);
  points[i].cur_cog = parseInt(points[i].cog.replace(/°/g,"").trim(), 10);
}

// Computing wind rotation from TWD[i] - TWD[i-1], then adjusting to fit within -180° and +180°, and deriving finaly angular speed from it
points[0].delta_twd = 0;
points[0].rotation = 0;

for (var i = 1; i < (points.length - 1) ; i++) {
  points[i].delta_twd = parseInt(points[i].twd.replace(/°/g,'')) - parseInt(points[i-1].twd.replace(/°/g,"")) ;
  if (points[i].delta_twd < -180 ) {
    points[i].delta_twd += 360;
  } else if(points[i].delta_twd > 180 ) {
    points[i].delta_twd -= 360;
  }
  points[i].rotation = points[i].delta_twd * 60 / points[i].delta_ttw ;
  points[i].rotation = points[i].rotation.toFixed(1) ;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Computing avTWA
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
for (var n = 0; n < (points.length - 1) ; n++) {
  points[n].twaList = [];

  for (var i = 0; i < (points.length - 1) ; i++) {
    let atwa_contrib = 0,
    atwa_in_tolerance = 0,
    atwa_cos_x = 0,
    atwa_sin_y = 0;

    if ( points[i+1].cur_ttw < (points[n].cur_ttw - atwaTimeWindow) ) { // i+1 is before window start, ignore
      atwa_contrib = 0;
      // from now points[i+1].cur_ttw >= (points[n].cur_ttw - atwaTimeWindow), i+1 is after window start
    } else if ( points[i].cur_ttw < (points[n].cur_ttw - atwaTimeWindow) ) { // i is before window start (i+1 is after), include the share
      atwa_contrib = points[i+1].cur_ttw - points[n].cur_ttw + atwaTimeWindow ;
      // from now points[i].cur_ttw >= (points[n].cur_ttw - atwaTimeWindow), i is after window start
    } else if ( points[i+1].cur_ttw <= (points[n].cur_ttw + atwaTimeWindow) ) { // i is after window start, i+1 is before window end, include all
      atwa_contrib = points[i+1].cur_ttw - points[i].cur_ttw ;
      // from now i+1 is after window end
    } else if ( points[i].cur_ttw >= (points[n].cur_ttw + atwaTimeWindow)) { // i is also after window end, ignore
      atwa_contrib = 0;
    } else { // i is before window end, include share
      atwa_contrib = points[n].cur_ttw + atwaTimeWindow - points[i].cur_ttw ;
    }
    //console.log('points['+i+'].cur_ttw='+points[i].cur_ttw+', points['+n+'].cur_ttw='+points[n].cur_ttw+', atwa_contrib='+ atwa_contrib );

    atwa_cos_x = Math.cos( Math.radians(points[i].cur_twa) ) * atwa_contrib;
    atwa_sin_y = Math.sin( Math.radians(points[i].cur_twa) ) * atwa_contrib;

    points[n].twaList.push( {
      atwa_cur_twa: points[i].cur_twa,
      atwa_contrib: atwa_contrib,
      atwa_cos_x: atwa_cos_x,
      atwa_sin_y: atwa_sin_y,
      atwa_in_tolerance : atwa_in_tolerance
    } );
  }
  // now fill atwa_cum_x and y, starting by n's contribution itself
  points[n].atwa_cum_x = points[n].twaList[n].atwa_cos_x;
  points[n].atwa_cum_y = points[n].twaList[n].atwa_sin_y;
  points[n].twaList[n].atwa_in_tolerance = 1; // n itself is always in tolerance
  points[n].atwa_nb_before = 0;
  points[n].atwa_nb_after = 0;

  // go backward from n to beg of list as long angle is in tolerance ; if yes add to atwa_cum_x and y
  for (var i = n-1; i >= 0 ; i--) {
    if (Math.abs(points[i].cur_twa - points[n].cur_twa) < atwaMaxTwaDif ) {
      points[n].twaList[i].atwa_in_tolerance = points[n].twaList[i+1].atwa_in_tolerance;
      if (points[n].twaList[i].atwa_in_tolerance == 1 && points[n].twaList[i].atwa_contrib > 0) {
        // in range and in time window ; count up
        points[n].atwa_nb_before += 1;
      }
      points[n].atwa_cum_x += points[n].twaList[i].atwa_cos_x * points[n].twaList[i].atwa_in_tolerance;
      points[n].atwa_cum_y += points[n].twaList[i].atwa_sin_y * points[n].twaList[i].atwa_in_tolerance;
    } else {
      points[n].twaList[i].atwa_in_tolerance = 0;  // any before will be 0 too
    }
  }

  // go forward from n to end of list as long angle is in tolerance ; if yes add to atwa_cum_x and y
  for (var i = n+1; i < points.length -1 ; i++) {
    if (Math.abs(points[i].cur_twa - points[n].cur_twa) < atwaMaxTwaDif ) {
      points[n].twaList[i].atwa_in_tolerance = points[n].twaList[i-1].atwa_in_tolerance;
      if (points[n].twaList[i].atwa_in_tolerance == 1 && points[n].twaList[i].atwa_contrib > 0) {
        // in range and in time window ; count up
        points[n].atwa_nb_after += 1;
      }
      points[n].atwa_cum_x += points[n].twaList[i].atwa_cos_x * points[n].twaList[i].atwa_in_tolerance;
      points[n].atwa_cum_y += points[n].twaList[i].atwa_sin_y * points[n].twaList[i].atwa_in_tolerance;
    } else {
      points[n].twaList[i].atwa_in_tolerance = 0;  // any after will be 0 too
    }
  }

  points[n].atwa_average = Math.degrees ( Math.atan2( points[n].atwa_cum_y , points[n].atwa_cum_x) ).toFixed(0);

  if (n > 1 && Math.abs(points[n].atwa_average - points[n-1].atwa_average) > atwaMaxAverageDif) {
    // too big of a step between n-1 and n ; let's signal this to user
    points[n].atwa_restart = true ;
  }
 // console.log(points[n]);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Computing avCOG
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
for (var n = 0; n < (points.length - 1) ; n++) {
  points[n].acogList = [];

  for (var i = 0; i < (points.length - 1) ; i++) {
    let acog_contrib = 0,
    acog_in_tolerance = 0,
    acog_cos_x = 0,
    acog_sin_y = 0;

    if ( points[i+1].cur_ttw < (points[n].cur_ttw - acogTimeWindow) ) { // i+1 is before window start, ignore
      acog_contrib = 0;
      // from now points[i+1].cur_ttw >= (points[n].cur_ttw - acogTimeWindow), i+1 is after window start
    } else if ( points[i].cur_ttw < (points[n].cur_ttw - acogTimeWindow) ) { // i is before window start (i+1 is after), include the share
      acog_contrib = points[i+1].cur_ttw - points[n].cur_ttw + acogTimeWindow ;
      // from now points[i].cur_ttw >= (points[n].cur_ttw - acogTimeWindow), i is after window start
    } else if ( points[i+1].cur_ttw <= (points[n].cur_ttw + acogTimeWindow) ) { // i is after window start, i+1 is before window end, include all
      acog_contrib = points[i+1].cur_ttw - points[i].cur_ttw ;
      // from now i+1 is after window end
    } else if ( points[i].cur_ttw >= (points[n].cur_ttw + acogTimeWindow)) { // i is also after window end, ignore
      acog_contrib = 0;
    } else { // i is before window end, include share
      acog_contrib = points[n].cur_ttw + acogTimeWindow - points[i].cur_ttw ;
    }
    //console.log('points['+i+'].cur_ttw='+points[i].cur_ttw+', points['+n+'].cur_ttw='+points[n].cur_ttw+', acog_contrib='+ acog_contrib );

    acog_cos_x = Math.cos( Math.radians(points[i].cur_cog) ) * acog_contrib;
    acog_sin_y = Math.sin( Math.radians(points[i].cur_cog) ) * acog_contrib;

    points[n].acogList.push( {
      acog_cur_cog: points[i].cur_cog,
      acog_contrib: acog_contrib,
      acog_cos_x: acog_cos_x,
      acog_sin_y: acog_sin_y,
      acog_in_tolerance : acog_in_tolerance
    } );
  }
  // now fill acog_cum_x and y, starting by n's contribution itself
  points[n].acog_cum_x = points[n].acogList[n].acog_cos_x;
  points[n].acog_cum_y = points[n].acogList[n].acog_sin_y;
  points[n].acogList[n].acog_in_tolerance = 1; // n itself is always in tolerance
  points[n].acog_nb_before = 0;
  points[n].acog_nb_after = 0;

  // go backward from n to beg of list as long angle is in tolerance ; if yes add to acog_cum_x and y
  for (var i = n-1; i >= 0 ; i--) {
    if (Math.abs(points[i].cur_cog - points[n].cur_cog) < acogMaxTwaDif ) {
      points[n].acogList[i].acog_in_tolerance = points[n].acogList[i+1].acog_in_tolerance;
      if (points[n].acogList[i].acog_in_tolerance == 1 && points[n].acogList[i].acog_contrib > 0) {
        // in range and in time window ; count up
        points[n].acog_nb_before += 1;
      }
      points[n].acog_cum_x += points[n].acogList[i].acog_cos_x * points[n].acogList[i].acog_in_tolerance;
      points[n].acog_cum_y += points[n].acogList[i].acog_sin_y * points[n].acogList[i].acog_in_tolerance;
    } else {
      points[n].acogList[i].acog_in_tolerance = 0;  // any before will be 0 too
    }
  }

  // go forward from n to end of list as long angle is in tolerance ; if yes add to acog_cum_x and y
  for (var i = n+1; i < points.length -1 ; i++) {
    if (Math.abs(points[i].cur_cog - points[n].cur_cog) < acogMaxTwaDif ) {
      points[n].acogList[i].acog_in_tolerance = points[n].acogList[i-1].acog_in_tolerance;
      if (points[n].acogList[i].acog_in_tolerance == 1 && points[n].acogList[i].acog_contrib > 0) {
        // in range and in time window ; count up
        points[n].acog_nb_after += 1;
      }
      points[n].acog_cum_x += points[n].acogList[i].acog_cos_x * points[n].acogList[i].acog_in_tolerance;
      points[n].acog_cum_y += points[n].acogList[i].acog_sin_y * points[n].acogList[i].acog_in_tolerance;
    } else {
      points[n].acogList[i].acog_in_tolerance = 0;  // any after will be 0 too
    }
  }
  // we're done with precalculation - use result
  points[n].acog_average = Math.degrees ( Math.atan2( points[n].acog_cum_y , points[n].acog_cum_x) ).toFixed(0);
  points[n].acog_average = (points[n].acog_average < 0 ? parseInt(points[n].acog_average) + 360 : points[n].acog_average );
  if (n > 1 && Math.abs(points[n].acog_average - points[n-1].acog_average) > acogMaxAverageDif) {
    // too big of a step between n-1 and n ; let's signal this to user
    points[n].acog_restart = true ;
  }
  //console.log(points[n]);
}

displayTable(displayLocalTime);
}

loadPointsForActiveTab();
