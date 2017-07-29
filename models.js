const mongoose = require('mongoose');

// schema to represent a blog post
const blogpostSchema = mongoose.Schema({
  author: {
    firstname: String,
    lastname: String
  },
  title: {type: String},
  content: {type: String}
});

blogpostSchema.virtual('name').get(function() {
  return this.author.firstname + ' ' + this.author.lastname;
});

// this is an *instance method* which will be available on all instances
// of the model. This method will be used to return an object that only
// exposes *some* of the fields we want from the underlying data
blogpostSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    author: this.name,
    title: this.title,
    content: this.content
  };
}

// note that all instance methods and virtual properties on this
// schema must be defined *before* the call to `.model` is made.
const Blogpost = mongoose.model('Blogpost', blogpostSchema);

module.exports = {Blogpost};
