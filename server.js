const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const multer = require('multer');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const userAuthSchema = require('./userAuthSchema');
const UserModel = require('./userModel');
const DisasterUser = require('./disasterModel');
const TransportAidRequest = require('./transportaid');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

const upload = multer();

// Ensure the MongoDB URI is correctly loaded from environment variables
const mongodbURI = process.env.MONGODB_URI;
if (!mongodbURI) {
  console.error('MongoDB URI not found in environment variables. Please check your .env file.');
  process.exit(1);
}

mongoose.connect(mongodbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  });

// Routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup.html'));
});

app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userAuthSchema({
      username: username,
      password: hashedPassword
    });

    await newUser.save();
    req.session.userId = newUser._id;
    res.redirect('/');
  } catch (err) {
    console.error('Error signing up:', err);
    res.status(500).json({ message: 'Failed to sign up' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userAuthSchema.findOne({ username: username });

    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user._id;
      res.redirect('/requests.html');
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ message: 'Failed to log in' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Failed to log out' });
    }
    res.redirect('/login');
  });
});

app.post('/submit-medical-aid-request', async (req, res) => {
  try {
    const { name, contact, location, type, details } = req.body;

    const newUser = new UserModel({
      name: name,
      contact: contact,
      location: location,
      type: type,
      details: details
    });

    await newUser.save();
    res.redirect('/struct.html?status=success');
  } catch (err) {
    console.error('Error submitting medical aid request:', err);
    res.status(500).json({ message: 'Failed to submit medical aid request' });
  }
});

app.post('/submit-transport-aid-request', async (req, res) => {
  try {
    const { name, contact, location, type, details } = req.body;

    const newAid = new TransportAidRequest({
      name: name,
      contact: contact,
      location: location,
      type: type,
      details: details
    });

    await newAid.save();
    res.redirect('/transportaid?status=success');
  } catch (err) {
    console.error('Error submitting transport aid request:', err);
    res.status(500).json({ message: 'Failed to submit transport aid request' });
  }
});

app.post('/volunteering', async (req, res) => {
  try {
    const { name, location, disastertype, numpeople, severity } = req.body;

    const newDisaster = new DisasterUser({
      name: name,
      location: location,
      disastertype: disastertype,
      numberofpeople: numpeople,
      severity: severity,
    });

    await newDisaster.save();
    res.redirect('/bla.html?status=success');
  } catch (err) {
    console.error('Error submitting volunteering request:', err);
    res.status(500).json({ message: 'Failed to submit volunteering request' });
  }
});

// API route to fetch all requests
app.get('/api/requests', async (req, res) => {
  try {
    const medicalAidRequests = await UserModel.find();
    const transportAidRequests = await TransportAidRequest.find();
    const volunteeringRequests = await DisasterUser.find();

    res.json({
      medicalAidRequests,
      transportAidRequests,
      volunteeringRequests
    });
  } catch (err) {
    console.error('Error fetching requests:', err);
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
});

// Serve HTML pages with authentication
app.get('/requests.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'requests.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/struct', (req, res) => {
  res.sendFile(path.join(__dirname, 'struct.html'));
});

app.get('/transportaid', (req, res) => {
  res.sendFile(path.join(__dirname, 'transportaid.html'));
});

app.get('/bla', (req, res) => {
  res.sendFile(path.join(__dirname, 'bla.html'));
});

app.get('/styles1.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'style1.css'));
});

// Chat feature with Socket.io
io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('chat message', (msg) => {
    console.log('Message received: ' + msg);
    io.emit('chat message', msg); // Broadcast message to all users
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
