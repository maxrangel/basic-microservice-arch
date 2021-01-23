const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

app.use(bodyParser.json());

const events = [];

app.post('/events', (req, res, next) => {
  const { event } = req.body;

  events.push(event);

  axios.post(`http://${process.env.POSTS_ADDRESS}/events`, { event }); // POSTS SERVICE
  axios.post(`http://${process.env.COMMENTS_ADDRESS}/events`, { event }); // COMMENTS SERVICE
  axios.post(`http://${process.env.QUERY_ADDRESS}/events`, { event }); // QUERY SERVICE
  axios.post(`http://${process.env.MODERATION_ADDRESS}/events`, { event }); // MODERATION SERVICE

  res.status(201).json({ status: 'Ok' });
});

app.get('/events', (req, res, next) => {
  res.status(200).json({ status: 'success', data: { events } });
});

app.listen(4005, () => {
  console.log('Event bus running on port 4005');
});
