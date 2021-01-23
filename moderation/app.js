const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

app.use(bodyParser.json());

app.post('/events', async (req, res, next) => {
  const { event } = req.body;
  if (event.type === 'CommentCreated') {
    const { comment, postId } = event;

    const status = comment.content.includes('orange') ? 'rejected' : 'approved';

    // EMMIT EVENT TO EVENT BUS
    await axios.post(`http://${process.env.EVENT_BUS_ADDRESS}/events`, {
      event: {
        type: 'CommentModerated',
        comment: { id: comment.id, postId, content: comment.content, status }
      }
    });
  }

  res.status(200).json({ status: 'success' });
});

app.listen(4003, () => {
  console.log('Moderation service running on port 4003');
});
