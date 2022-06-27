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
  // startTime();
});

document.getElementById('timeline-date').addEventListener('onchange', () => {

});
