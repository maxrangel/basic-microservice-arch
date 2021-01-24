const express = require('express');
const { randomBytes } = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use('*', cors());

app.use(bodyParser.json());

const posts = {};

app.get('/posts', (req, res) => {
  res.status(200).json({
    data: { posts }
  });
});

app.post('/posts-create', async (req, res) => {
  const { title } = req.body;
  const id = randomBytes(4).toString('hex');

  posts[id] = { title, id };

  // EMMIT EVENT TO EVENT BUS
  await axios.post(`http://${process.env.EVENT_BUS_ADDRESS}/events`, {
    event: {
      type: 'PostCreated',
      post: { title, id }
    }
  });

  res.status(201).json({ data: { post: posts[id] } });
});

// EVENT RECEIVER
app.post('/events', (req, res, next) => {
  const { event } = req.body;
  console.log(event.type);

  res.status(200).json({ status: 'Ok' });
});

app.listen(4000, () => {
  console.log('Posts service on port 4000');
});
