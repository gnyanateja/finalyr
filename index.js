const express = require('express')
const PORT = process.env.PORT || 5000
var usersRouter = require('./routes/app');

// add mongoose
 var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://narutoteja:teja@cluster0-0q64p.mongodb.net/test?retryWrites=true/pmail',{useNewUrlParser: true});

var app = express();
app.use(express.json());
  
app.use('/', usersRouter);

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
