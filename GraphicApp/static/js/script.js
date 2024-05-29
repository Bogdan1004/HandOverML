let map = L.map('map', {
    center: [45.75372, 21.22571],
    zoom: 14,
    minZoom: 14,
    maxZoom: 15
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '@Preda Bogdan',
    minZoom: 14,
    maxZoom: 15
}).addTo(map);

var personIcon = L.icon({
    iconUrl: '/static/images/person-icon.png',
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40]
});

var antennaIcon = L.icon({
    iconUrl: '/static/images/antenna-icon.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});

var userMarker = L.marker([45.75372, 21.22571], {icon: personIcon, draggable: true}).addTo(map);

var otherPeople = [
    [45.75472, 21.22571],
    [45.75372, 21.22671],
    [45.75272, 21.22471],
    [45.75572, 21.22571],
    [45.75372, 21.22771],
    [45.75172, 21.22371],
    [45.75400, 21.22800],
    [45.75200, 21.22200]
];

var otherMarkers = otherPeople.map(person => {
    return L.marker(person, {icon: personIcon, draggable: true}).addTo(map);
});

var center = [45.75372, 21.22571];
var radius = 0.0075;

function getCirclePoints(center, radius, count) {
    var points = [];
    for (var i = 0; i < count; i++) {
        var angle = 2 * Math.PI * i / count;
        var lat = center[0] + radius * Math.cos(angle);
        var lng = center[1] + radius * Math.sin(angle);
        points.push([lat, lng]);
    }
    return points;
}
var antennas = getCirclePoints(center, radius, 6);
antennas.push(center);

var heat = L.heatLayer([], {radius: 100, blur: 30, maxZoom: 16, max: 0.8}).addTo(map);

var strongestAntenna = null;

function calculateSignalIntensity(latlng) {
    let maxDistance = 500;
    let signalContributions = antennas.map(antenna => {
        let distance = map.distance(latlng, antenna);
        let strength = Math.max(0, (maxDistance - distance) / maxDistance);
        return strength;
    });

    let combinedStrength = signalContributions.reduce((total, current) => total + current, 0);
    return Math.min(combinedStrength, 1);
}

function updateHeatmap() {
    let heatMapData = antennas.map(antenna => {
        let intensity = calculateSignalIntensity(antenna);
        return [antenna[0], antenna[1], intensity];
    });
    heat.setLatLngs(heatMapData);
}

var strongestAntenna = null;
var secondStrongestAntenna = null;
let handoverOccurred = false;
let lastConnectedAntenna = null;
let handoverCount = 0;
let resetHandoverTimeout = null;
let moveCount = 0;

function resetHandoverCount() {
    handoverCount = 0;
    $('#handoverCount').text('Handovers: ' + handoverCount);
}

function calculateSignal(latlng) {
    let sortedAntennas = antennas.map((antenna, index) => ({
        id: index,
        position: antenna,
        distance: map.distance(latlng, antenna)
    })).sort((a, b) => a.distance - b.distance);

    let info = sortedAntennas.map((n, index) => {
        let signalStrength = Math.max(0, 100 - (n.distance / 5));
        let quality = 'Poor';
        if (signalStrength > 75) {
            quality = 'Excellent';
        } else if (signalStrength > 50) {
            quality = 'Good';
        } else if (signalStrength > 25) {
            quality = 'Fair';
        }
        return { id: n.id, signalStrength: signalStrength.toFixed(2), quality };
    });
    
    if (info[0].signalStrength < 10 && info[1].signalStrength < 10) {
        $('#handoverMessage').html('Conexiune Pierdută');
        lastConnectedAntenna = null;
        moveCount = 0;
        clearTimeout(resetHandoverTimeout);
    } else if (lastConnectedAntenna === null || strongestAntenna !== info[0].id) {
        if (lastConnectedAntenna !== null && strongestAntenna !== info[0].id) {
            handoverCount++;
            moveCount = 0;
        }
        if (handoverCount >= 5) {
            $('#handoverMessage').html('Tic Tac Handover Detected<br> Conectat la antena ' + info[0].id);
            handoverCount = 0;
        } else {
            $('#handoverMessage').html('Handover realizat cu succes!<br>Conectat la antena ' + info[0].id);
        }
        lastConnectedAntenna = info[0].id;
        handoverOccurred = true;
        $('#handoverCount').text('Handovers: ' + handoverCount);
        clearTimeout(resetHandoverTimeout);
        resetHandoverTimeout = setTimeout(resetHandoverCount, 3000);
    } else if (handoverOccurred) {
        $('#handoverMessage').html('Conectat la antena ' + info[0].id);
        handoverOccurred = false;
        clearTimeout(resetHandoverTimeout);
        resetHandoverTimeout = setTimeout(resetHandoverCount, 3000);
    } else {
        $('#handoverMessage').html('Conectat la antena ' + lastConnectedAntenna);
        clearTimeout(resetHandoverTimeout);
        resetHandoverTimeout = setTimeout(resetHandoverCount, 3000);
    }

    if (lastConnectedAntenna === info[0].id) {
        moveCount++;
        if (moveCount >= 2) {
            resetHandoverCount();
        }
    } else {
        moveCount = 0;
    }

  strongestAntenna = info[0].id;
  secondStrongestAntenna = info[1].id;
  
  $('#signalStrength1').text('RSRP ' + info[0].id + ': ' + info[0].signalStrength + '%');
  $('#signalQuality1').text('RSRQ ' + info[0].id + ': ' + info[0].quality);
  $('#signalStrength2').text('RSRP ' + info[1].id + ': ' + info[1].signalStrength + '%');
  $('#signalQuality2').text('RSRQ ' + info[1].id + ': ' + info[1].quality);

  updateCellLoad(info[0].id, info[1].id); 
}

function updateSINRDisplay(latlng) {
    calculateSignal(latlng);
}

function updateCellLoad(strongestAntennaId, secondStrongestAntennaId) {
    const maxCapacity = 5; 

    let peoplePositions = [userMarker.getLatLng()];
    otherMarkers.forEach(marker => {
        peoplePositions.push(marker.getLatLng());
    });

    let loadInfo = antennas.map((antenna, index) => {
        let count = peoplePositions.reduce((acc, pos) => {
            if (map.distance(pos, antenna) <= 350) { 
                return acc + 1;
            }
            return acc;
        }, 0);
        
        let loadPercentage = Math.min(100, (count / maxCapacity) * 100).toFixed(2);
        
        return { id: index, load: loadPercentage };
    });

    let filteredLoadInfo = loadInfo.filter(info => info.id === strongestAntennaId || info.id === secondStrongestAntennaId)
        .map(info => `Cell Load ${info.id}: ${info.load}%`)
        .join('<br>');

    $('#cellLoad').html(filteredLoadInfo);
}

function moveUser(direction) {
    $('#handoverMessage').text('');
    let currentPos = userMarker.getLatLng();
    switch (direction) {
        case 'north':
            userMarker.setLatLng([currentPos.lat + 0.0005, currentPos.lng]);
            break;
        case 'south':
            userMarker.setLatLng([currentPos.lat - 0.0005, currentPos.lng]);
            break;
        case 'east':
            userMarker.setLatLng([currentPos.lat, currentPos.lng + 0.0005]);
            break;
        case 'west':
            userMarker.setLatLng([currentPos.lat, currentPos.lng - 0.0005]);
            break;
    }
    updateSINRDisplay(userMarker.getLatLng());
}

antennas.forEach(function(coordinate, index) {
  var customIcon = L.divIcon({
      html: `<div><img src="/static/images/antenna-icon.png" style="width: 30px; height: 30px; position: absolute; top: -30px; left: -15px;"><div style="text-align: center; width: 30px; position: absolute; top: 0px; left: -15px;">ID: ${index}</div></div>`,
      iconSize: [30, 60],
      iconAnchor: [15, 30],
      className: ''
  });

  L.marker(coordinate, {icon: customIcon}).addTo(map);
});

userMarker.on('dragend', function(e) {
    updateSINRDisplay(userMarker.getLatLng());
});

otherMarkers.forEach(marker => {
    marker.on('dragend', function(e) {
        updateSINRDisplay(marker.getLatLng());
    });
});

updateHeatmap();
updateCellLoad(strongestAntenna, secondStrongestAntenna); 

document.getElementById('moveUp').addEventListener('click', () => moveUser('north'));
document.getElementById('moveDown').addEventListener('click', () => moveUser('south'));
document.getElementById('moveLeft').addEventListener('click', () => moveUser('west'));
document.getElementById('moveRight').addEventListener('click', () => moveUser('east'));

document.addEventListener('keydown', function(event) {
    switch (event.key) {
        case 'w':
            moveUser('north');
            break;
        case 'a':
            moveUser('west');
            break;
        case 's':
            moveUser('south');
            break;
        case 'd':
            moveUser('east');
            break;
    }
});
