const getData = async () => {
    try {
       let fetched = await fetch("https://purplejellyfish.herokuapp.com/allObs");
       if(fetched) {
           let read = await fetched.json()
           console.log(read.features);
           // displayDataonMap(read);
           displayDataonMap_Cluster(read);
           displayDataonMap_Heatmap(read);
       }
   }
   catch (error) {
     alert('Database does not response :(');
     throw new Error(error.message);
   }
}


const postData = async (obs) => {
  fetch("https://purplejellyfish.herokuapp.com/", {
      method: "POST",
      body: JSON.stringify(obs),
      headers: {
          "Content-type": "application/json; charset=UTF-8"
      }
  }).then(response => response.text())
    .then(text => console.log(text));
}
