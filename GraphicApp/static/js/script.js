let map = L.map('map', {
    center: [45.75372, 21.22571],
    zoom: 14,
    minZoom: 14, // Minimul de zoom permis (mai departe nu se poate)
    maxZoom: 15  // Maximul de zoom permis (mai aproape nu se poate)
  });
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '@Preda Bogdan',
    minZoom: 14, // Asigură-te că stratul de dale respectă aceeași restricție
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
  // Centrul și raza cercului pentru plasarea antenelor
  var center = [45.75372, 21.22571];
  var radius = 0.0075; // aproximativ egal cu 1 km, depinde de latitudine
  
  
  // Funcție pentru calculul coordonatelor pe un cerc
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
  antennas.push(center); // Adăugăm antena din centru
  
  
  
  var heat = L.heatLayer([], {radius: 100, blur: 30, maxZoom: 16, max: 0.8}).addTo(map);
  
  var strongestAntenna = null;  // Variabilă pentru stocarea antenei cu cel mai puternic semnal
  
  
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
  
  // function calculateSignal(latlng) {
  //     let sortedAntennas = antennas.map((antenna, index) => ({
  //         id: index,
  //         position: antenna,
  //         distance: map.distance(latlng, antenna)
  //     })).sort((a, b) => a.distance - b.distance);
  
  //     let info = sortedAntennas.map(n => {
  //         let signalStrength = Math.max(0, 100 - (n.distance / 5));
  //         let quality = 'Poor';
  //         if (signalStrength > 75) {
  //             quality = 'Excellent';
  //         } else if (signalStrength > 50) {
  //             quality = 'Good';
  //         } else if (signalStrength > 25) {
  //             quality = 'Fair';
  //         }
  //         return { id: n.id, signalStrength: signalStrength.toFixed(2), quality };
  //     });
  
  //     // Verificare și afișare handover
  //     if (strongestAntenna !== null && strongestAntenna === info[1].id) {
  //         $('#handoverMessage').text('Handover realizat cu succes!');
  //     }
  //     strongestAntenna = info[0].id;  // Actualizăm antena cu cel mai puternic semnal
  
  //     $('#signalStrength1').text('Puterea antenei 1: ' + info[0].signalStrength + '%');
  //     $('#signalQuality1').text('Calitatea antenei 1: ' + info[0].quality);
  //     $('#signalStrength2').text('Puterea antenei 2: ' + info[1].signalStrength + '%');
  //     $('#signalQuality2').text('Calitatea antenei 2: ' + info[1].quality);
  // }
  let handoverOccurred = false;  // Starea handover-ului
  let lastConnectedAntenna = null;  // Ultima antenă la care a fost conectat utilizatorul
  
  
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
    
        // Verificare dacă există vreo conexiune valabilă
        if (info[0].signalStrength < 10 && info[1].signalStrength < 10) {
        $('#handoverMessage').html('Conexiune Pierdută');
        lastConnectedAntenna = null;
    } else if (lastConnectedAntenna === null || strongestAntenna !== info[0].id) {
        // Handover sau reconectare după o zonă fără conexiune
        $('#handoverMessage').html('Handover realizat cu succes!<br>Conectat la antena ' + info[0].id);
        lastConnectedAntenna = info[0].id;
        handoverOccurred = true;
    } else if (handoverOccurred) {
        $('#handoverMessage').html('Conectat la antena ' + info[0].id);
        handoverOccurred = false;
    } else {
        $('#handoverMessage').html('Conectat la antena ' + lastConnectedAntenna);
    }
  
  
    strongestAntenna = info[0].id;
    
    // Utilizăm indexul din sortare pentru a afișa informațiile
    $('#signalStrength1').text('RSRP ' + info[0].id + ': ' + info[0].signalStrength + '%');
    $('#signalQuality1').text('RSRQ ' + info[0].id + ': ' + info[0].quality);
    $('#signalStrength2').text('RSRP ' + info[1].id + ': ' + info[1].signalStrength + '%');
    $('#signalQuality2').text('RSRQ ' + info[1].id + ': ' + info[1].quality);
  }
  
  function updateSINRDisplay(latlng) {
      calculateSignal(latlng);
  }
  
  function moveUser(direction) {
      $('#handoverMessage').text('');
      let currentPos = userMarker.getLatLng();
      switch (direction) {
          case 'north':
              userMarker.setLatLng([currentPos.lat + 0.001, currentPos.lng]);
              break;
          case 'south':
              userMarker.setLatLng([currentPos.lat - 0.001, currentPos.lng]);
              break;
          case 'east':
              userMarker.setLatLng([currentPos.lat, currentPos.lng + 0.001]);
              break;
          case 'west':
              userMarker.setLatLng([currentPos.lat, currentPos.lng - 0.001]);
              break;
      }
      updateSINRDisplay(userMarker.getLatLng());
  }
  
  antennas.forEach(function(coordinate, index) {
    var customIcon = L.divIcon({
        html: `<div><img src="/static/images/antenna-icon.png" style="width: 30px; height: 30px; position: absolute; top: -30px; left: -15px;"><div style="text-align: center; width: 30px; position: absolute; top: 0px; left: -15px;">ID: ${index}</div></div>`,
        iconSize: [30, 60], // Setting size of the icon to accommodate the image and the text
        iconAnchor: [15, 30], // Anchoring the icon so that the image is correctly positioned
        className: '' // Prevent default class for custom styling
    });
  
    L.marker(coordinate, {icon: customIcon}).addTo(map);
  });
  
  userMarker.on('dragend', function(e) {
      updateSINRDisplay(userMarker.getLatLng());
  });
  updateHeatmap();
  
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
  