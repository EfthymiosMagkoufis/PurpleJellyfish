const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const port = process.env.PORT || 5000;
const db = require('./queries');
const cors = require('cors');

app.use(express.static('client'));
app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)

const server = app.listen(port, () => {
  const port = server.address().port;
  console.log( `App is working on port ${port}`);
});

app.get('/allObs', db.getObservations);
app.post('/Obs', db.createObservation);
app.delete('/obs/:id', db.deleteObservation);
