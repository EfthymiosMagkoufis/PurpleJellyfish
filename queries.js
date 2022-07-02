const pg = require('pg').Pool;
require('dotenv').config();
// const pool = new pg({
//   user: process.env.db_user,
//   host: process.env.db_host,
//   database: process.env.db,
//   password: process.env.db_password, //.env file
//   port:process.env.db_port,
// });

const pool = new pg({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const getObservations = (req,res) =>{
  pool.query('SELECT * FROM iNaturalist', (error,results) =>{
    if (error) {
      throw error;
    }
    let data = createGeoJson(results.rows)
    res.status(200).json(data);
  })
}

const createObservation = (req, res) => {
  const { name, comment, longitude, latitude, obsDate, date } = req.body

  pool.query('INSERT INTO observations (name, comment, longitude, latitude, obsDate, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [name, comment, longitude, latitude, obsDate, date], (error, results) => {
    if (error) {
      console.log("error");
      throw error
    }
    res.status(201).send(`Observation added with ID: ${results.rows[0].id}`)
  })
}

const deleteObservation = (req, res) => {
  const id = parseInt(req.params.id);
  pool.query('DELETE FROM observations WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    res.status(200).send(`Observation deleted with ID: ${id}`)
  })
}

module.exports = {
  getObservations,
  createObservation,
  deleteObservation
}

//----Geojson format

const createGeoJson = (data) => {
  let geojson = {
  "type": "FeatureCollection",
  "features": []
  };
  for (let com of data) {
  let feature = {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [com.longitude,com.latitude]
      },
      "properties": {
        "id": com.id,
        "name": com.name,
        "comment": com.comment,
        "obsDate": com.obsdate,
        "date": com.date,
        }
    };
    // console.log(geojson.features);
    // console.log(feature);
    geojson.features.push(feature);
  }
  return geojson;
}
