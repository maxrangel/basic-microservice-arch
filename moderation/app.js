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

    await axios.post('http://localhost:4005/events', {
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
