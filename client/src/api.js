const getData = async () => {
    try {
       // let fetched = await fetch("https://purplejellyfish.herokuapp.com/allObs");
       let fetched = await fetch("http://localhost:5000/allObs");
       if(fetched) {
           let data = await fetched.json()
           console.log(data.features);
           // displayDataonMap(data);
           displayDataonMap_Cluster(data);
           displayDataonMap_Heatmap(data);
           pre_timeVisualization(data);
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
