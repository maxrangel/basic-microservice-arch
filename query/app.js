const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

app.use('*', cors());
app.use(bodyParser.json());

const posts = {};

const handleEvents = event => {
  if (event.type === 'PostCreated') {
    const { post } = event;
    posts[post.id] = { id: post.id, title: post.title, comments: [] };
  } else if (event.type === 'CommentCreated') {
    const { comment, postId, status } = event;

    const post = posts[postId];
    post.comments.push({ id: comment.id, content: comment.content, status });
  } else if (event.type === 'CommentUpdated') {
    const { id, postId, content, status } = event.data;

    const post = posts[postId];
    const comment = post.comments.find(comment => comment.id === id);

    comment.content = content;
    comment.status = status;
  }
};

// GET THE LIST OF ALL POSTS
app.get('/posts', (req, res, next) => {
  res.status(200).json({ status: 'success', data: { posts } });
});

// CREATE POST OR COMMENT HANDLER
app.post('/events', (req, res, next) => {
  const { event } = req.body;
  handleEvents(event);
  res.status(201).json({ status: 'success' });
});

app.listen(4002, async () => {
  console.log('Query service running on port 4002');

  const res = await axios.get('http://localhost:4005/events');

  for (let event of res.data.data.events) {
    console.log(`Handling event of type: ${event.type}`);
    handleEvents(event);
  }
});
