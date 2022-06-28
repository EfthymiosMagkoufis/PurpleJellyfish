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
  document.getElementById('info-btn').style.visibility = "visible";
  document.getElementById('download-btn').style.visibility = "visible";

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
  // console.log(false);
}
//-------------

let activeComForm = false;
const markerList = [];
let db_data;
const db_data_sort = [];
const db_data_sort_dates = [];
let timeInterval = null;
let intervalPointer = 0;
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


// timelapse Visualization

const pre_timeVisualization = (data) => {
  data.features = data.features.sort((a, b) => new Date(a.properties.date) - new Date(b.properties.date) );

  for (let feature of data.features) {
    db_data_sort_dates.push(feature.properties.date);
  }
  db_data_sort.push(data);
  let temp_dates = [];
  temp_dates.push(db_data_sort_dates[0]);
  for (let i in db_data_sort_dates) {
    if (temp_dates[temp_dates.length-1] !== db_data_sort_dates[i]) {
      temp_dates.push(db_data_sort_dates[i]);
    }
  }
  db_data_sort_dates.length = 0;
  for (let date of temp_dates) {
    db_data_sort_dates.push(date)
  }
  let obs = countObs(db_data_sort_dates[0]);
  let date = db_data_sort_dates[0].split('T');
      date[1] = date[1].split(':');
      date = date[0] + ' ' + date[1][0] + ":" + date[1][1];
  document.getElementById('timelapse-date').value = date;
  document.getElementById('timelapse-text').innerHTML = `Day ${intervalPointer+1} : ${obs} Obs`;
}

const countObs = (date) =>{
  let count_obs = 0;
  for (let feature of db_data_sort[0].features){
    if (new Date(date) >= new Date(feature.properties.date)) {
      count_obs ++ ;
    }else {
      break;
    }
  }
  return count_obs;
}

const timeVisualization = () => {
  let obs, last_obs, timelapse_data;
    timeInterval = setInterval(() => {
                    timelapse_data = select_data(db_data_sort_dates[intervalPointer]);
                    let vis = recognizeVis();
                    if (vis === 'cluster') {
                      map.getSource('observations-cluster').setData(timelapse_data);
                    }else if (vis === 'heatmap') {
                      map.getSource('observations-heatmap').setData(timelapse_data);
                    }


                    if (intervalPointer === db_data_sort_dates.length) {intervalPointer=0; console.log('first');}
                    console.log(db_data_sort_dates[intervalPointer],intervalPointer);
                    if (intervalPointer === 0) last_obs = 0; else last_obs = obs;
                    obs = countObs(db_data_sort_dates[intervalPointer]);
                    let date = db_data_sort_dates[intervalPointer].split('T');
                        date[1] = date[1].split(':');
                        date = date[0] + ' ' + date[1][0] + ":" + date[1][1];
                    let days = ((new Date(db_data_sort_dates[intervalPointer]).getTime() - new Date(db_data_sort_dates[0]).getTime())/ (1000 * 3600 * 24))+1;
                    document.getElementById('timelapse-date').value = date;
                    document.getElementById('timelapse-text').innerHTML = `Day ${days.toFixed(0)} : ${obs} Obs`;
                    intervalPointer++;

                  }, 700);
}

const select_data = (date) => {
  let geojson ={
       "type": "FeatureCollection",
       "features": []
      };
  for (let feature of db_data_sort[0].features) {
    if (new Date(feature.properties.date) < new Date(date) ) {
      geojson.features.push(feature);
    }
  }
  return geojson;
}

const recognizeVis = () => {
  let visibility = map.getLayoutProperty('cluster-0', 'visibility');
  let vis;
  if (visibility === 'visible' || visibility === undefined ) {
    // map.removeImage('jellyfish');
    // map.removeLayer('cluster-0');
    // map.removeLayer('cluster-1');
    // map.removeLayer('cluster-2');
    // map.removeLayer('cluster-count');
    // map.removeLayer('unclustered-points');
  	// map.removeSource('observations-cluster');
    vis = 'cluster';
  }else{
    // map.removeLayer('jellyfish-heat');
    // map.removeSource('observations-heatmap');
    vis = 'heatmap';
  }
  return vis;
}
