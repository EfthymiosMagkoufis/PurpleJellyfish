mapboxgl.accessToken = 'pk.eyJ1IjoidGhlbWlzLW1hZyIsImEiOiJja2c2c2oyYWcwMDcwMnFvY2hwbTVnM291In0.0dPkSnZY6GNE09bNbqB-ZQ';

const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/light-v10', // style URL
  center: [23.7961216, 38.01088], // starting position [lng, lat]
  zoom: 5 // starting zoom
});


map.on('load', () =>{
  map.addControl(
    new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      marker:false,
      mapboxgl: mapboxgl
    })
  );

  map.addControl(new mapboxgl.NavigationControl());
  const geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true
  });
  map.addControl(geolocate);
  let user_lat, user_lon;
  geolocate.on('geolocate', (e) => {
    user_lon = e.coords.longitude;
    user_lat = e.coords.latitude;
    let position = [user_lon,user_lat];
    console.log(position);
  });

  let data = getData();
});

displayDataonMap = (data) => {
  let bounds = new mapboxgl.LngLatBounds();
  for (let comment of data.features) {
    createMarker(
    {
      'lng': comment.geometry.coordinates[0],
      'lat': comment.geometry.coordinates[1]
    },
     comment.properties.name,
     comment.properties.comment,
     comment.properties.date,
     fly=false
   );
   bounds.extend([comment.geometry.coordinates[0],comment.geometry.coordinates[1]]);
  }
  map.fitBounds(bounds, {
    padding: 100
  });
};


let date1 = new Date('2022-04-03');
let date2 = new Date('2022-05-25');
if (date1 > date2) {
  console.log(true);
}else if (date2 > date1) {
  console.log(false);
}
//-------------

let activeComForm = false;
const markerList = [];
// find location and display a marker to map

const form_visibility = (a) =>{
  let visibility = document.getElementsByClassName('comment-form')[0].style.visibility;
  let style = document.getElementsByClassName('comment-form')[0].style;
  if (visibility === 'hidden' || visibility === '' ) {
    style.left = '20px';
    style.opacity = '1';
    style.visibility = 'visible';
  }else if (a!=='btn'){
    style.visibility = 'hidden';
    style.opacity = '0';
    style.left = '-250px';
  }
}
const stab_visibility = (a) =>{
  let visibility = document.getElementsByClassName('select-tab')[0].style.visibility;
  let style = document.getElementsByClassName('select-tab')[0].style;
  if (visibility === 'hidden' || visibility === '' ) {
    style.top = '150px';
    style.opacity = '1';
    style.visibility = 'visible';
  }else if (a!=='btn'){
    style.visibility = 'hidden';
    style.opacity = '0';
    style.top = '-150px';
  }
}

const createMarker = (location,name,comment,date,fly) => {
  if (fly) {
    map.flyTo({
      center: [location.lng,location.lat], zoom:8, pitch:40, essential: true
    });
  }
  let marker =  new mapboxgl.Marker({
                  color: '#a75fdc'
                }).setLngLat([location.lng,location.lat])
                  .addTo(map);
  activeComForm = true;
  if (name!==undefined && comment!==undefined) {
    date = date.split('T'); date = date[0];
    marker.setPopup(new mapboxgl.Popup(/*{offset: [0, -70]}*/)
    .setHTML(`<div class="popup-content"><b><u>${name}</b></u> observed:<br>${comment}<br>Observation Date: ${date}</>`))
  }
  markerList.push(marker);
}

const removeMarker = (marker) => {
  // console.log(markerList);
  // console.log(marker);
  marker.remove();
  let location = marker._lngLat;
  markerList.pop();
  return location;
}


const changeVisualization = () => {
  let visibility = map.getLayoutProperty('cluster-0', 'visibility');
  if (visibility === 'visible' || visibility === undefined ) {
    map.setLayoutProperty('cluster-0', 'visibility', 'none');
    map.setLayoutProperty('cluster-1', 'visibility', 'none');
    map.setLayoutProperty('cluster-2', 'visibility', 'none');
    map.setLayoutProperty('unclustered-points', 'visibility', 'none');
    map.setLayoutProperty('cluster-count', 'visibility', 'none');
    map.setLayoutProperty('jellyfish-heat', 'visibility', 'visible');
  }else{
    map.setLayoutProperty('jellyfish-heat', 'visibility', 'none');
    map.setLayoutProperty('cluster-0', 'visibility', 'visible');
    map.setLayoutProperty('cluster-1', 'visibility', 'visible');
    map.setLayoutProperty('cluster-2', 'visibility', 'visible');
    map.setLayoutProperty('cluster-count', 'visibility', 'visible');
    map.setLayoutProperty('unclustered-points', 'visibility', 'visible');
  }
}

const uploadObservation = () => {
  let name = document.getElementById('your-name');
  let comment = document.getElementById('your-comment');
  let date = document.getElementById('your-date');
  // console.log(name.value); console.log(comment.value); console.log(date.value);
  if (name.value == '') {
    alert('pleace insert a Nickname first')
    return;
  }else if (comment.value == '') {
    alert('pleace insert a Comment first')
    return;
  }else if (date.value === undefined) {
    alert('Pleace insert an Observation Date first')
    return;
  }
  activeComForm = false;
  form_visibility();
  let location = removeMarker(markerList[markerList.length-1]);
  // let date = new Date().toISOString();
  // postData({
  //   "name": name.value,
  //   "comment": comment.value,
  //   "longitude": location.lng,
  //   "latitude": location.lat,
  //   "date": date
  // });
  createMarker({'lng': location.lng ,'lat': location.lat},name.value,comment.value,date.value,true);
  comment.value = '';
  name.value = '';
  document.getElementById('add-com').disabled = false;
}
