// https://api.inaturalist.org/v1/observations?verifiable=true&order_by=observations.id&order=desc&page=1&spam=false&taxon_id=256089&swlng=21.61219911285894&swlat=37.34444501635445&nelng=26.30336122223394&nelat=39.707656882032005&locale=en-US&per_page=24
mapboxgl.accessToken = 'pk.eyJ1IjoidGhlbWlzLW1hZyIsImEiOiJja2c2c2oyYWcwMDcwMnFvY2hwbTVnM291In0.0dPkSnZY6GNE09bNbqB-ZQ';

const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/light-v10', // style URL
  center: [23.7961216, 38.01088], // starting position [lng, lat]
  zoom: 5.7,
  // projection: 'globe'
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

  // getNumofData();
  getData();
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
     comment.properties.obsDate,
     fly=false
   );
   bounds.extend([comment.geometry.coordinates[0],comment.geometry.coordinates[1]]);
  }
  map.fitBounds(bounds, {
    padding: 100
  });


};


//-------------

let activeComForm = false;
const markerList = [];
let db_data;
const db_data_sort = [];
const fixed_db_data = [];
const db_data_sort_dates = [];
const all_dates = [];
let timeInterval = null;
let intervalPointer = 0;

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
    alert('Insert a Nickname first')
    return;
  }else if (comment.value == '') {
    alert('Insert a Comment first')
    return;
  }else if (date.value === undefined) {
    alert('Insert an Observation Date first')
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
  console.log('pre_timeVisualization');
  data.features = data.features.sort((a, b) => new Date(a.properties.obsDate) - new Date(b.properties.obsDate) );

  for (let feature of data.features) {
    db_data_sort_dates.push(feature.properties.obsDate);
  }
  db_data_sort.push(data);
  all_dates.push(db_data_sort_dates[0]);
  for (let i in db_data_sort_dates) {
    if (all_dates[all_dates.length-1] !== db_data_sort_dates[i]) {
      all_dates.push(db_data_sort_dates[i]);
    }
  }
  db_data_sort_dates.length = 0;
  for (let date of all_dates) {
    db_data_sort_dates.push(date);
  }
  let obs = countObs(db_data_sort_dates[0]);
  let f_date = db_data_sort_dates[0].split('T');
      f_date[1] = f_date[1].split(':');
      f_date = f_date[0] + ' ' + f_date[1][0] + ":" + f_date[1][1];
  let l_date = db_data_sort_dates[db_data_sort_dates.length - 1].split('T');
      l_date[1] = l_date[1].split(':');
      l_date = l_date[0] + ' ' + l_date[1][0] + ":" + l_date[1][1];
  document.getElementById('timelapse-date').value = f_date;
  document.getElementById('timelapse-text').innerHTML = `Day ${intervalPointer+1} : ${obs} Obs`;
  document.getElementById('timelapse-info-text').innerHTML = `${db_data.features.length} Obs in this period`;

  f_date = f_date.split(" "); f_date = f_date[0];
  l_date = l_date.split(" "); l_date = l_date[0];

  document.getElementById('from').value = f_date;
  document.getElementById('from').min = f_date;
  document.getElementById('from').max = l_date;

  document.getElementById('to').value = l_date;
  document.getElementById('to').min = f_date;
  document.getElementById('to').max = l_date;

  buildChart(db_data_sort_dates,db_data_sort[0].features);
}

const countObs = (date) =>{
  let count_obs = 0;
  let f_date = new Date(document.getElementById('from').value);
  let l_date = new Date(document.getElementById('to').value);
  if (fixed_db_data.length > 0 ) fixed_db_data[0].features.length = 0;
  for (let feature of db_data_sort[0].features){
    let obs_date = new Date(feature.properties.obsDate)
    if (obs_date >= f_date && obs_date <= l_date && obs_date <= new Date(date) ) {
      if (fixed_db_data.length > 0 ) fixed_db_data[0].features.push(feature);
      count_obs ++ ;
    }else {
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
                    buildChart(db_data_sort_dates,intervalPointer,timelapse_data.features);
                    if (intervalPointer === db_data_sort_dates.length) intervalPointer=0;
                    // console.log(db_data_sort_dates[intervalPointer],intervalPointer);
                    if (intervalPointer === 0) last_obs = 0; else last_obs = obs;
                    obs = countObs(db_data_sort_dates[intervalPointer]);
                    let date = db_data_sort_dates[intervalPointer].split('T');
                        date[1] = date[1].split(':');
                        date = date[0] + ' ' + date[1][0] + ":" + date[1][1];
                    let days = ((new Date(db_data_sort_dates[intervalPointer]).getTime() - new Date(db_data_sort_dates[0]).getTime())/ (1000 * 3600 * 24))+1;
                    document.getElementById('timelapse-date').value = date;
                    document.getElementById('timelapse-text').innerHTML = `Day ${days.toFixed(0)} : ${obs} Obs`;
                    intervalPointer++;

                  }, 650);
}

const select_data = (date) => {
  let geojson ={
       "type": "FeatureCollection",
       "features": []
      };
  let f_date = new Date(document.getElementById('from').value);
  let l_date = new Date(document.getElementById('to').value);
  for (let feature of db_data_sort[0].features) {
    if (new Date(feature.properties.obsDate) >= f_date && new Date(feature.properties.obsDate) <= l_date  && new Date(feature.properties.obsDate) <= new Date(date)) {
      geojson.features.push(feature);

    }
  }
  fixed_db_data.push(geojson);
  return geojson;
}

const stopVis = () => {
  clearInterval(timeInterval);
  document.getElementById('pause').style.display = 'none';
  document.getElementById('play').style.display = 'block';
  countObs(db_data_sort_dates[db_data_sort_dates.length - 1])
  let vis = recognizeVis();
  let data = fixed_db_data.length > 0 ? fixed_db_data[0] : db_data;
  if (vis === 'cluster'){
    map.getSource('observations-cluster').setData(data);
  }else if (vis === 'heatmap') {
    map.getSource('observations-heatmap').setData(data);
  }
  document.getElementById('pause').style.disabled = true;
  intervalPointer = 0;
}

const fitDatesOnTimePeriod = () => {
  let f_date = new Date(document.getElementById('from').value);
  let l_date = new Date(document.getElementById('to').value);
  let new_dates_array = [];
  for (let date of all_dates) {
    if (new Date(date) >= f_date && new Date(date) <= l_date) {
      new_dates_array.push(date);
    }
  }
  db_data_sort_dates.length = 0;
  for (let date of new_dates_array) {
    db_data_sort_dates.push(date);
  }
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


const download_data = () => {
  let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db_data));
  let dlAnchorElem = document.getElementById('download-btn-a');
  dlAnchorElem.setAttribute("href",     dataStr     );
  dlAnchorElem.setAttribute("download", "purplejellyfish_data.geojson");
}


const buildChart = (labels,inp,chart_data) => {
  let chart_data_array = new Array(inp+1).fill(0);
  let i = 0;
  labels.map(function(date){
    date = date.split("T");
    date = date[0];
    console.log(date);
    return date;
  });
  console.log(labels);
  while (i <= inp) {
    for (let f of chart_data) {
      if (f.properties.obsDate === labels[i]) {
        chart_data_array[i] ++;
      }
    }
    i++;
  }

  const data = {
    labels: labels,
    datasets: [
      {
        label: "",
        backgroundColor: "rgba(255,99,132,0.2)",
        borderColor: "rgba(255,99,132,1)",
        borderWidth: 2,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        data: chart_data_array
      },
      {
        label: "",
        backgroundColor: "rgba(255,99,132,0.2)",
        borderColor: "rgba(255,99,132,1)",
        borderWidth: 2,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        data: chart_data_array
      }
    ]
  };

  const option = {
    //- next 2 lines for response chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
         legend: {
            display: false
         }
    },
    scales: {
      xAxes: {
        display: false,
        scaleLabel: {
            display: true,
            labelString: 'Month'
        }
      },
      yAxes: {
        display: true,
        ticks: {
            beginAtZero: false,
            autoSkip: false,
            min: 0,
            max: 100,
        }
      }
    },
    animation: {
       duration: 0
   }

  };
  document.querySelector('.chart-area').innerHTML = '<canvas  id="line-chart"></canvas>';
  const ctx = document.getElementById('line-chart');
  const myChart = new Chart(ctx, {
      type: "line",
      options: option,
      data: data
  });
  myChart.update();

}
