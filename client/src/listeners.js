document.getElementById('add-com').addEventListener("click", ()=>{
  stab_visibility();
});
document.getElementById('geo-loc').addEventListener("click", ()=>{
  navigator.geolocation.getCurrentPosition(position => {
    console.log(position.coords);
    stab_visibility();
    form_visibility('btn');
    createMarker({'lng': position.coords.longitude ,'lat': position.coords.latitude});
  });
  document.getElementById('add-com').disabled = true;

});

document.getElementById('loc-on-map').addEventListener("click", ()=>{
  stab_visibility();
  map.getCanvas().style.cursor = 'pointer';
  map.once('click', (e)=>{
    let coords = e.lngLat;
    // console.log(coords);
    createMarker({'lng': coords.lng ,'lat': coords.lat});
    form_visibility();
    map.getCanvas().style.cursor = '';
  });
  document.getElementById('add-com').disabled = true;
});


document.getElementById('comment-form-close').addEventListener("click", ()=>{
  form_visibility();
  removeMarker(markerList[markerList.length-1])
  document.getElementById('add-com').disabled = false;
});

document.getElementById('comment-stab-close').addEventListener("click", ()=>{
  stab_visibility();
});
document.getElementById('upload-btn').addEventListener("click", ()=>{
  uploadObservation();
});

document.getElementById('vis-switch').addEventListener('click', () => {
  changeVisualization();
});

document.getElementById('pause').addEventListener('click', () => {
 clearInterval(timeInterval);
 document.getElementById('pause').style.display = 'none';
 document.getElementById('play').style.display = 'block';
 // pauseTime();
});
document.getElementById('play').addEventListener('click', () => {
  timeVisualization();
  document.getElementById('play').style.display = 'none';
  document.getElementById('pause').style.display = 'block';
  document.getElementById('pause').style.disabled = false;
  // startTime();
});

document.getElementById('stop').addEventListener('click', () => {
  clearInterval(timeInterval);
  document.getElementById('pause').style.display = 'none';
  document.getElementById('play').style.display = 'block';
  let vis = recognizeVis();
  if (vis === 'cluster') {
    map.getSource('observations-cluster').setData(db_data);
  }else if (vis === 'heatmap') {
    map.getSource('observations-heatmap').setData(db_data);
  }
  document.getElementById('pause').style.disabled = true;
  intervalPointer = 0;
});

document.getElementById('timelapse-date').addEventListener('onchange', () => {
  let date_input = document.getElementById('timelapse-date').value;
  console.log(date_input);
});

document.getElementById('download-btn').addEventListener('click', () => {
  download_data();
});

document.getElementById('info-btn').addEventListener('click', () => {
  document.querySelector('.info-background').style.visibility = 'visible';
  let style = document.querySelector('.info-tab').style;
  style.top = '100px';
  style.opacity = "1";
  style.visibility = 'visible';
});

document.getElementById('close-info-btn').addEventListener('click', () => {
  let style = document.querySelector('.info-tab').style;
  style.top = '-300px';
  style.opacity = '0';
  style.visibility = 'hidden';
  document.querySelector('.info-background').style.visibility = 'hidden';

});
