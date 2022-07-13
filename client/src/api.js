const getData = async () => {
    try {
       let fetched = await fetch("https://purplejellyfish.herokuapp.com/allObs");
       if(fetched) {
           let data = await fetched.json();
           console.log(data.features);
           let usersfetched = await fetch("https://purplejellyfish.herokuapp.com/allUsersObs");
           if (usersfetched) {
             let usersdata = await usersfetched.json();
             console.log(usersdata.features);
             for (f of usersdata.features) {
               data.features.push(f);
             }
             db_data = data;
             displayDataonMap_Cluster(data);
             displayDataonMap_Heatmap(data);
             pre_timeVisualization(data);
             document.getElementById('loading-animation').style.display = 'none';
           }
       }
   }
   catch (error) {
     alert('Database does not response :(');
     throw new Error(error.message);
   }
}

// const getData = async () => {
//     try {
//        let fetched = await fetch("http://localhost:5000/allUsersObs");
//        if(fetched) {
//            let data = await fetched.json()
//            console.log(data.features);
//            db_data = data;
//            displayDataonMap_Cluster(data);
//            displayDataonMap_Heatmap(data);
//            pre_timeVisualization(data);
//            document.getElementById('loading-animation').style.display = 'none';
//
//        }
//    }
//    catch (error) {
//      alert('Database does not response :(');
//      throw new Error(error.message);
//    }
// }


const postData = async (obs) => {
  fetch("https://purplejellyfish.herokuapp.com/Obs", {
  // fetch("http://localhost:5000/Obs", {
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
    geojson.features.push(feature);
  }
  return geojson;
}
