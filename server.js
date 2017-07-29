// created on July 29, 2017 for Thinkful Unit 2 Lesson 2 Project 3
// by Steven Povlitz. Project is a blog api with mongo peristance

const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

// Mongoose internally uses a promise-like object,
// but its better to make Mongoose use built in es6 promises
mongoose.Promise = global.Promise;

// config.js holds constatns for app like PORT and DATABASE_URL
const {PORT, DATABASE_URL} = require('./config');
const {Blogpost} = require('./models');
