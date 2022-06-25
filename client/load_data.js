const loadData = async () => {
    try {
       let fetched = await fetch("client/load_data.js");
       if(fetched) {
         // console.log(fetched);
          let observations = await fetched.json();
          for (let obs of observations.data) {
            // postdata(obs);
          };
          // console.log(creategeojson(observations.results));
       }
   }
   catch (error) {
     throw new Error(error.message);
   }
}

loadData();

const creategeojson = (data) => {
  const json = {"data":[]};
  for (let obs of data) {
  let date = new Date().toISOString();
  let feature = {
      "name" : "iNaturalist Observer",
      "comment" : obs.species_guess,
      "longitude" : obs.geojson.coordinates[0],
      "latitude" : obs.geojson.coordinates[1],
      "obsDate" : obs.observed_on,
      "date" : date,

   }
    // console.log(geojson.features);
    json.data.push(feature);
  }
  return json;
}


const postdata = async (obs) => {
  fetch("https://localhost:3000/Obs/", {
  // fetch("http://localhost:3000/Obs/", {
      method: "POST",
      body: JSON.stringify(obs),
      headers: {
          "Content-type": "application/json; charset=UTF-8"
      }
  }).then(response => response.text())
    .then(text => console.log(text));
};
