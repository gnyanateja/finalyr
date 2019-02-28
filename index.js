const express = require('express')
const PORT = process.env.PORT || 5000
var usersRouter = require('./routes/app');

var cors=require('cors');
app.use(cors({
    origin:['http://localhost:4200']
  }));

// add mongoose
 var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://narutoteja:teja@cluster0-0q64p.mongodb.net/pmail?retryWrites=true',{useNewUrlParser: true});

var app = express();
app.use(express.json());
  
app.use('/', usersRouter);

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
