const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

app.use(bodyParser.json());

const events = [];

app.post('/events', (req, res, next) => {
  const { event } = req.body;

  events.push(event);

  axios.post('http://localhost:4000/events', { event }); // POSTS SERVICE
  axios.post('http://localhost:4001/events', { event }); // COMMENTS SERVICE
  axios.post('http://localhost:4002/events', { event }); // QUERY SERVICE
  axios.post('http://localhost:4003/events', { event }); // MODERATION SERVICE

  res.status(201).json({ status: 'Ok' });
});

app.get('/events', (req, res, next) => {
  res.status(200).json({ status: 'success', data: { events } });
});

app.listen(4005, () => {
  console.log('Event bus running on port 4005');
});
