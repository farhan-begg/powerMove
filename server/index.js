const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');


const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': '620beae900b3fa0012dafd9b',
      'PLAID-SECRET': '8bce065ba3c5f80cb26f619b5f1dde'

    }
  }
})

const plaidClient = new PlaidApi(configuration)
const app = express();
app.use(cors());
app.use(bodyParser.json());


app.post('/create_link_token', async function (request, response) {
  // Get the client_user_id by searching for the current user
  // const user = await User.find(...);
  // const clientUserId = user.id;
  const plaidRequest = {
    user: {
      // This should correspond to a unique id for the current user.
      client_user_id: 'user',
    },
    client_name: 'Plaid Test App',
    products: ['auth'],
    language: 'en',
    redirect_uri: 'http://localhost:3000/',
    country_codes: ['US'],
  };
  try {
    const createTokenResponse = await plaidClient.linkTokenCreate(plaidRequest);
    response.json(createTokenResponse.data);
  } catch (error) {
    response.status(500)
  }
});


app.post('/exchange_public_token', async function (
  request,
  response,
  next,
) {
  const publicToken = request.body.public_token;
  try {
    const plaidResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    const accessToken = plaidResponse.data.access_token;
    response.json({ accessToken });
  } catch (error) {
    response.status(500).send({ error: 'failed' });
  }
});


app.post("/auth", async (request, response) => {
  try {
    const access_token = request.body.access_token;
    const plaidRequest = { access_token: access_token }
    const plaidResponse = await plaidClient.authGet(plaidRequest);
    const accountData = plaidResponse.data.accounts;
    response.json(accountData)
  } catch (error) {
    response.status(500).send({ error: 'failed' });
  }
})


app.listen(8000, () => {
  console.log('server has started')
})