const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const config = require('config');

const { startDatabase } = require('./database/mongo');
const { insertAd, getAds, deleteAd, updateAd, getAdById } = require('./database/ads');

// defining the Express app
const app = express();

// defining an array to work as the database (temporary solution)
const ads = [
  { title: 'Hello, world (again)!' }
];

const authParams = config.get('authentication');

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authParams.AUTH_DOMAIN}/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: authParams.API_ENDPOINT,
  issuer: `https://${authParams.AUTH_DOMAIN}/`,
  algorithms: ['RS256']
});

app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'));
app.use(checkJwt);

app.get('/', async (req, res) => {
  res.send(await getAds());
});

app.get('/:id', async (req, res) => {
  res.send(await getAdById(req.params.id));
});

app.post('/', async (req, res) => {
  const newAd = req.body;
  await insertAd(newAd);
  res.send({ message: 'New ad inserted.' });
});

app.delete('/:id', async (req, res) => {
  await deleteAd(req.params.id);
  res.send({ message: 'Ad removed.' });
});

app.put('/:id', async (req, res) => {
  const updatedAd = req.body;
  await updateAd(req.params.id, updatedAd);
  res.send({ message: 'Ad updated.' });
});

const appConfig = config.get('app');

app.listen(appConfig.PORT, () => {
  console.log(`listening on port ${appConfig.PORT}`);
});
