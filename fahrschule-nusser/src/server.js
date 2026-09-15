require('dotenv').config();

const app = require('./app');

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Fahrschule Nusser – Server läuft auf http://localhost:${port}`);
});
