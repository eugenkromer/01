require('dotenv').config();

const app = require('./app');
const content = require('./content');

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`${content.business.name} – Server läuft auf http://localhost:${port}`);
});
