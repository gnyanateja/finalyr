const express = require('express')
const PORT = process.env.PORT || 5000
var usersRouter = require('./routes/app');

// add mongoose
// var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/pmail',{useNewUrlParser: true});

var app = express();
app.use(express.json());
  
app.use('/', usersRouter);

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
