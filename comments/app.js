const express = require('express');
const { randomBytes } = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use('*', cors());

app.use(bodyParser.json());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
  const { id } = req.params;
  const comments = commentsByPostId[id] || [];

  res.status(200).json({ data: { comments } });
});

app.post('/posts/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  const commentId = randomBytes(4).toString('hex');
  const comments = commentsByPostId[id] || [];

  comments.push({ id: commentId, content, status: 'pending' });

  commentsByPostId[id] = comments;

  // EMMIT EVENT TO EVENT BUS
  await axios.post(`http://${process.env.EVENT_BUS_ADDRESS}/events`, {
    event: {
      type: 'CommentCreated',
      comment: { id: commentId, content },
      postId: id,
      status: 'pending'
    }
  });

  res.status(201).json({ data: { comments: commentsByPostId } });
});

// EVENT RECEIVER
app.post('/events', async (req, res, next) => {
  const { event } = req.body;
  const { type } = event;

  if (type === 'CommentModerated') {
    const { id, postId, content, status } = event.comment;
    const comments = commentsByPostId[postId];

    const comment = comments.find(comment => comment.id === id);
    comment.status = status;

    // EMMIT EVENT TO EVENT BUS
    await axios.post(`http://${process.env.EVENT_BUS_ADDRESS}/events`, {
      event: {
        type: 'CommentUpdated',
        data: { id, postId, content, status }
      }
    });
  }

  res.status(200).json({ status: 'Ok' });
});

app.listen(4001, () => {
  console.log('Comments service on port 4001');
});
