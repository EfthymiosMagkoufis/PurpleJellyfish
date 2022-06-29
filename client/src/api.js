const getNumofData = async () => {
  try {
    let fetched = await fetch("https://api.inaturalist.org/v1/observations?verifiable=any&order_by=observations.id&order=desc&page=1&spam=false&d1=2022-01-01&project_id=jellyfish-of-greece&locale=en-US&per_page=1&return_bounds=true");
    if(fetched) {
      let data = await fetched.json()
      console.log(data.total_results);
      getData(data.total_results);
    }
  } catch (e) {
    alert('iNaturalist API does not response :(');
    throw new Error(e.message);
  }
}

const getData = async () => {
    try {
       // let fetched = await fetch("https://purplejellyfish.herokuapp.com/allObs");
       let fetched = await fetch("http://localhost:5000/allObs");
       // let fetched = await fetch(`https://api.inaturalist.org/v1/observations?verifiable=any&order_by=observations.id&order=desc&page=1&spam=false&d1=2022-01-01&project_id=jellyfish-of-greece&locale=en-US&per_page=${num}&return_bounds=true`);
       if(fetched) {
           let data = await fetched.json()
           // data = collectData(data.results);
           console.log(data.features);
           // displayDataonMap(data);
           db_data = data;
           displayDataonMap_Cluster(data);
           displayDataonMap_Heatmap(data);
           pre_timeVisualization(data);
           document.getElementById('loading-animation').style.display = 'none';

       }
   }
   catch (error) {
     alert('Database does not response :(');
     throw new Error(error.message);
   }
}


const postData = async (obs) => {
  // fetch("https://purplejellyfish.herokuapp.com/", {
  fetch("http://localhost:5000/Obs", {
      method: "POST",
      body: JSON.stringify(obs),
      headers: {
          "Content-type": "application/json; charset=UTF-8"
      }
  }).then(response => response.text())
    .then(text => console.log(text));
}


const collectData = (data) => {
  let geojson = {
  "type": "FeatureCollection",
  "features": []
  };
  for (let f of data) {
    if (f.taxon.preferred_common_name !== "Mauve Stinger") {
      console.log(f.taxon.preferred_common_name);
      continue;
    }
  let feature = {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": f.geojson.coordinates
      },
      "properties": {
        "id": f.id,
        "name": "iNaturalist Observer",
        "comment": f.species_guess,
        "obsDate": f.observed_on,
        }
    };
    // console.log(geojson.features);
    // console.log(feature);
    geojson.features.push(feature);
  }
  return geojson;
}
