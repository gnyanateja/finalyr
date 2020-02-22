const express = require('express')
const PORT = process.env.PORT || 5000
var usersRouter = require('./routes/app');
var app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// add mongoose
 var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://narutoteja:teja@cluster0-0q64p.mongodb.net/pmail?retryWrites=true',{useNewUrlParser: true});

app.use(express.json());
  
app.use('/', usersRouter);

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
