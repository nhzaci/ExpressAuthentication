const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const cors = require('cors');

//Initialise app
const app = express();

//MW
//Form data MW
app.use(express.urlencoded({extended:false}));
//Json MW
app.use(express.json());
//Cors mw
app.use(cors());
//Setting up static directory
app.use(express.static(path.join(__dirname, 'public')));
//Use passport mw
app.use(passport.initialize());
//Use passport config
require('./config/passport')(passport);

//Bring in db config
const db = require('./config/keys').mongoURI;
mongoose.connect(db, { 
    useNewUrlParser: true ,
    useUnifiedTopology: true
})
.then(() => {
    console.log(`Successfully connected to ${db}`)
})
.catch(err => {
    console.log(err);
});

app.get('/', (req, res) => {
    return res.send("<h1>Hello World</h1>");
})

const users = require('./routes/api/users');
app.use('/api/users', users);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`)
})