// index.js
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Form = require('./models/form');

mongoose.connect('mongodb://localhost:27017/contactform');

app.post('/submit', async (req, res) => {
  const { files } = req;

  try {
    const upload = new AWS.S3.ManagedUpload({
      params: {
        Body: files.photo.data,
        Key: generateUniqueFileName(files.photo.name),
        ACL: 'public-read',
      },
      service: s3,
    });

    const response = await upload.promise();

    const { fullName, email, message } = req.body;
    const submission = new Form({
      fullName: fullName,
      email: email,
      message: message,
      photo: response.Location,
    });

    submission.save();

    res.send(submission);
  } catch (error) {
    res.send(error);
  }
});