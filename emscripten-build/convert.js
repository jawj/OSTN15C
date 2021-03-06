// Generated by CoffeeScript 1.10.0
var OSTN02C, arrow, degFmt, displayGeoid, displayGps, displayOsgb, dmsChanged, drawMap, formatAlt, formatEOrN, formatLatOrLon, gbMap, gpsChanged, gpsFields, id, input, j, l, len, len1, len2, loadData, m, mapCanvas, mapCtx, osgbChanged, osgbFields, parseAlt, parseEorN, parseLatOrLon, ref, saveData, showMissing,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

ref = ['e', 'n', 'mslAlt', 'datum', 'lat', 'lon', 'gpsAlt', 'dms', 'dec'];
for (j = 0, len = ref.length; j < len; j++) {
  id = ref[j];
  self[id + 'Field'] = get({
    id: id
  });
}

osgbFields = [eField, nField, mslAltField, datumField];

gpsFields = [lonField, latField, gpsAltField];

degFmt = get({
  id: 'inputs'
}).elements.degFmt;

mapCanvas = get({
  id: 'mapCanvas'
});

mapCtx = mapCanvas.getContext('2d');

arrow = get({
  id: 'arrow'
});

parseLatOrLon = function(s, isLat) {
  var dec, deg, dir, dms, maxVal, min, ref1, ref2, ref3, sec, value;
  dec = s.match(/^\s*-?([0-9]+|[0-9]+\.[0-9]*|[0-9]*\.[0-9]+)\s*$/);
  if (dec) {
    value = parseFloat(s);
  } else {
    dms = s.match(/^\s*([NESW])?\s*([0-9]+)(([^0-9]+([0-9]+))([^0-9]+([0-9]+|[0-9]+\.[0-9]*|[0-9]*\.[0-9]+))?)?[^NESW0-9]*([NESW])?\s*$/i);
    if (!dms) {
      return null;
    }
    deg = parseInt(dms[2]);
    min = parseInt((ref1 = dms[5]) != null ? ref1 : '0');
    sec = parseFloat((ref2 = dms[7]) != null ? ref2 : '0');
    if (min >= 60 || sec >= 60) {
      return null;
    }
    if ((dms[1] == null) && (dms[8] == null)) {
      return null;
    }
    if ((dms[1] != null) && (dms[8] != null)) {
      return null;
    }
    dir = ((ref3 = dms[1]) != null ? ref3 : dms[8]).toUpperCase();
    if ((isLat && (dir !== 'N' && dir !== 'S')) || ((!isLat) && (dir !== 'E' && dir !== 'W'))) {
      return null;
    }
    value = OSTN02C.decimalFromDegMinSec({
      deg: deg,
      min: min,
      sec: sec,
      westOrSouth: dir === 'W' || dir === 'S'
    });
  }
  maxVal = isLat ? 90 : 180;
  if (value < -maxVal || value > maxVal) {
    return null;
  }
  return value;
};

parseEorN = function(s) {
  var validFormat;
  validFormat = s.match(/^\s*-?([0-9]+|[0-9]+\.[0-9]*|[0-9]*\.[0-9]+)\s*$/);
  if (validFormat) {
    return parseFloat(s);
  } else {
    return null;
  }
};

parseAlt = function(s) {
  var validFormat;
  validFormat = s.match(/^\s*-?([0-9]+|[0-9]+\.[0-9]*|[0-9]*\.[0-9]+)\s*m?\s*$/);
  if (validFormat) {
    return parseFloat(s);
  } else {
    return null;
  }
};

formatLatOrLon = function(v, isLat) {
  var dir, dms;
  if (degFmt.value === 'dms') {
    dms = OSTN02C.degMinSecFromDecimal(v);
    dir = isLat ? (dms.westOrSouth ? 'S' : 'N') : (dms.westOrSouth ? 'W' : 'E');
    return dms.deg + "\u00b0\u2008" + dms.min + "\u2032\u2008" + (dms.sec.toFixed(2)) + "\u2033 " + dir;
  } else {
    return v.toFixed(6);
  }
};

formatEOrN = function(v) {
  return v.toFixed(0);
};

formatAlt = function(alt) {
  return (Math.round(alt)) + 'm';
};

showMissing = function(inputs) {
  var input, l, len1, results;
  results = [];
  for (l = 0, len1 = inputs.length; l < len1; l++) {
    input = inputs[l];
    results.push(input.value = "???");
  }
  return results;
};

displayGps = function(latLon) {
  if (latLon != null) {
    latField.value = formatLatOrLon(latLon.lat, true);
    lonField.value = formatLatOrLon(latLon.lon, false);
    gpsAltField.value = formatAlt(latLon.elevation);
    return drawMap(true);
  } else {
    showMissing(gpsFields);
    return drawMap(false);
  }
};

displayOsgb = function(en) {
  displayGeoid(en);
  if (en != null) {
    eField.value = formatEOrN(en.e);
    nField.value = formatEOrN(en.n);
    mslAltField.value = formatAlt(en.elevation);
    return drawMap(true);
  } else {
    showMissing(osgbFields);
    return drawMap(false);
  }
};

displayGeoid = function(en) {
  var geoidCaption, geoidName, geoidRegion;
  if (en != null) {
    geoidName = OSTN02C.geoidNameForIndex(en.geoid);
    geoidRegion = OSTN02C.geoidRegionForIndex(en.geoid);
    geoidCaption = geoidRegion + (geoidName === geoidRegion ? '' : " (" + geoidName + ")");
    return datumField.innerHTML = geoidCaption;
  } else {
    return datumField.innerHTML = "???";
  }
};

osgbChanged = function() {
  var e, elevation, enETRS89, i, input, l, len1, n, ref1, s, strs, values;
  strs = (function() {
    var l, len1, ref1, results;
    ref1 = osgbFields.slice(0, 3);
    results = [];
    for (l = 0, len1 = ref1.length; l < len1; l++) {
      input = ref1[l];
      results.push(input.value);
    }
    return results;
  })();
  values = (function() {
    var l, len1, results;
    results = [];
    for (i = l = 0, len1 = strs.length; l < len1; i = ++l) {
      s = strs[i];
      results.push(i === 2 ? parseAlt(s) : parseEorN(s));
    }
    return results;
  })();
  ref1 = osgbFields.slice(0, 3);
  for (i = l = 0, len1 = ref1.length; l < len1; i = ++l) {
    input = ref1[i];
    cls(input, values[i] != null ? {
      remove: 'invalid'
    } : {
      add: 'invalid'
    });
  }
  if (indexOf.call(values, null) >= 0) {
    displayGps(null);
    displayGeoid(null);
    return;
  }
  e = values[0], n = values[1], elevation = values[2];
  enETRS89 = OSTN02C.ETRS89EastingNorthingFromOSGB36EastingNorthing({
    e: e,
    n: n,
    elevation: elevation,
    geoid: 0
  });
  if (enETRS89.geoid === 0) {
    displayGps(null);
    displayGeoid(enETRS89);
    return;
  }
  displayGeoid(enETRS89);
  displayGps(OSTN02C.ETRS89LatLonFromETRS89EastingNorthing(enETRS89));
  cls(arrow, {
    remove: 'reverse'
  });
  return saveData('coords', {
    changed: 'osgb',
    values: strs
  });
};

gpsChanged = function() {
  var elevation, en, i, input, l, lat, len1, lon, s, strs, values;
  strs = (function() {
    var l, len1, results;
    results = [];
    for (l = 0, len1 = gpsFields.length; l < len1; l++) {
      input = gpsFields[l];
      results.push(input.value);
    }
    return results;
  })();
  values = (function() {
    var l, len1, results;
    results = [];
    for (i = l = 0, len1 = strs.length; l < len1; i = ++l) {
      s = strs[i];
      results.push(i === 2 ? parseAlt(s) : parseLatOrLon(s, i === 1));
    }
    return results;
  })();
  for (i = l = 0, len1 = gpsFields.length; l < len1; i = ++l) {
    input = gpsFields[i];
    cls(input, values[i] != null ? {
      remove: 'invalid'
    } : {
      add: 'invalid'
    });
  }
  if (indexOf.call(values, null) >= 0) {
    displayOsgb(null);
    return;
  }
  lon = values[0], lat = values[1], elevation = values[2];
  en = OSTN02C.OSGB36EastingNorthingFromETRS89EastingNorthing(OSTN02C.ETRS89EastingNorthingFromETRS89LatLon({
    lat: lat,
    lon: lon,
    elevation: elevation
  }));
  if (en.geoid === 0) {
    displayOsgb(null);
    displayGeoid(en);
    return;
  }
  displayOsgb(en);
  cls(arrow, {
    add: 'reverse'
  });
  return saveData('coords', {
    changed: 'gps',
    values: strs
  });
};

dmsChanged = function() {
  var field, i, isLat, l, len1, ref1, value;
  ref1 = [lonField, latField];
  for (i = l = 0, len1 = ref1.length; l < len1; i = ++l) {
    field = ref1[i];
    isLat = i === 1;
    value = parseLatOrLon(field.value, isLat);
    if (value) {
      field.value = formatLatOrLon(value, isLat);
    }
  }
  return saveData('degFmt', degFmt.value);
};

drawMap = function(xMarksTheSpot) {
  var e, n, x, y;
  mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
  mapCtx.globalAlpha = 0.5;
  mapCtx.drawImage(gbMap, 10, 10);
  if (xMarksTheSpot) {
    e = parseFloat(eField.value);
    n = parseFloat(nField.value);
    x = 10 + e / 1500;
    y = -10 + mapCanvas.height - n / 1500;
    mapCtx.globalAlpha = 1.0;
    mapCtx.beginPath();
    mapCtx.moveTo(x - 10, y);
    mapCtx.lineTo(x + 10, y);
    mapCtx.moveTo(x, y - 10);
    mapCtx.lineTo(x, y + 10);
    mapCtx.lineWidth = 4;
    mapCtx.strokeStyle = '#fff';
    return mapCtx.stroke();
  }
};

saveData = function(k, v) {
  var ref1;
  return (ref1 = self.localStorage) != null ? ref1.setItem(k, JSON.stringify(v)) : void 0;
};

loadData = function(k) {
  var ref1;
  return JSON.parse((ref1 = self.localStorage) != null ? ref1.getItem(k) : void 0);
};

for (l = 0, len1 = osgbFields.length; l < len1; l++) {
  input = osgbFields[l];
  input.oninput = osgbChanged;
}

for (m = 0, len2 = gpsFields.length; m < len2; m++) {
  input = gpsFields[m];
  input.oninput = gpsChanged;
}

decField.onclick = dmsField.onclick = dmsChanged;

OSTN02C = OSTN02CFactory(null, null, null, function() {
  var fields, i, len3, o, prevData, prevDegFmt, ref1, ref2, ref3, value;
  prevDegFmt = (ref1 = loadData('degFmt')) != null ? ref1 : 'dec';
  degFmt.value = prevDegFmt;
  prevData = (ref2 = loadData('coords')) != null ? ref2 : {
    changed: 'osgb',
    values: ['530450', '105593', '67m']
  };
  fields = prevData.changed === 'osgb' ? osgbFields : gpsFields;
  ref3 = prevData.values;
  for (i = o = 0, len3 = ref3.length; o < len3; i = ++o) {
    value = ref3[i];
    fields[i].value = value;
  }
  if (prevData.changed === 'osgb') {
    osgbChanged();
  } else {
    gpsChanged();
  }
  return dmsChanged();
});

gbMap = make({
  tag: 'img',
  src: 'data:image/png;base64,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'
});

//# sourceMappingURL=convert.js.map
