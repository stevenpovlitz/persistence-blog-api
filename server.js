// created on July 29, 2017 for Thinkful Unit 2 Lesson 2 Project 3
// by Steven Povlitz. Project is a blog api with mongo persistence

const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

// Mongoose internally uses a promise-like object,
// but its better to make Mongoose use built in es6 promises
mongoose.Promise = global.Promise;

// config.js holds constatns for app like PORT and DATABASE_URL
const {PORT, DATABASE_URL} = require('./config');
const {Blogpost} = require('./models');

const app = express();
app.use(bodyParser.json());
app.use(morgan('common'));

// GET request
app.get('/posts', (req, res) => {
  Blogpost
    .find()
    .then(Blogposts => res.json(
      Blogposts.map(blogpost => blogpost.apiRepr())
    ))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

app.get('/posts:id', (req, res) => {
  Blogpost
    .findById(req.params.id)
    .exec()
    .then(blogpost => res.json(blogpost.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

app.post('/posts', (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      console.log(req.body);
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Blogpost
    .create({
      author: req.body.author,
      content: req.body.content,
      title: req.body.title
    })
    .then(restaurant => res.status(201).json(restaurant.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error while creating blogpost'});
    });
});

app.put('/posts/:id', (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    res.status(400).json({message: message});
  }

  const toUpdate = {};
  const updatableFields = ['title', 'author', 'content']

  updatableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Blogpost
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .exec()
    .then(blogpost => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error while updating blog post'}));
});

app.delete('/posts/:id', (req, res) => {
  Blogpost
  .findByIdAndRemove(req.params.id)
  .exec()
  .then(restaurant => res.status(204).end())
  .catch(err => res.status(500).json({message: 'Internal server error while deleting post'}));
})

// catch-all endpoint if client makes request to non-existent endpoint
app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});

// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl=DATABASE_URL, port=PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, {"useMongoClient": true}, err => {
      if (err) {
        console.log("Got an error");
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
