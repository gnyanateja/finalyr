var express = require('express');
var router = express.Router();
var User = require('../models/user');
var jwt = require('jsonwebtoken');
var mongoose=require('mongoose');
var db=mongoose.connection;



router.post('/register',  function(req,res,next){
  console.log('hi');
  console.log(req.body.email);
  const user = new User({
    email: req.body.email,
    first_name:req.body.first_name,
    last_name:req.body.last_name,
    phone_no:req.body.phone_no,
    gender:req.body.gender,
    password: User.hashPassword(req.body.password),
    creation_dt: Date.now()
  });
  let promise = user.save();

  promise.then(function(doc){
    return res.status(201).json(doc);
  })

  promise.catch(function(err){
    return res.status(501).json({message: 'Error registering user.'})
  })
})

router.post('/login', function(req,res,next){
  console.log(req.body.email);
   let promise = User.findOne({email:req.body.email}).exec();
   promise.then(function(doc){
    if(doc) {
      if(doc.isValid(req.body.password)){
          // generate token
          let token = jwt.sign({email:doc.email},'secret', {expiresIn : '3h'});

          return res.status(200).send({'token':token});

      } else {
        return res.status(501).json({message:' Invalid Credentials'});
      }
    }
    else {
      return res.status(501).json({message:'User email is not registered.'})
    }
   });

   promise.catch(function(err){
     return res.status(501).json({message:'Some internal error'});
   })
})


router.get('/validateEmail',function(req,res){
  db.collection('pmail_users').find({"email":req.body.email}).toArray(function(err,mails){
    if(err)
    console.log(err);
  else
    res.send({"mails":mails});
  });
});

router.get('/validatePhone',function(req,res){
  db.collection('pmail_users').find({"phone_no":req.body.phone_no}).toArray(function(err,nos){
    if(err)
    console.log(err);
  else
    res.send({"nos":nos});
  });
});



router.post('/compose',function(req,res){
  var today = new Date();
var hh = today.getHours(); // => 9
var mm = today.getMinutes(); // =>  30
var ss = today.getSeconds();
var dd = today.getDate();
var mm = today.getMonth() + 1; //January is 0!
var yyyy = today.getFullYear();
if (dd < 10) {
  dd = '0' + dd;
}
if (mm < 10) {
  mm = '0' + mm;
}
var today = dd + '/' + mm + '/' + yyyy;
var time = hh + ":" + mm + ":" + ss;

  let token = req.body.token;
  jwt.verify(token,'secret', function(err, tokendata){
    if(err){
      return res.status(400).send({"message":"Unauthorized request"});
    }
    if(tokendata){
      decodedToken = tokendata;
      const user=decodedToken.email+'_composed';
    const user1=req.body.to+'_recieved';
    db.collection(user).insertOne({
      reciever:req.body.to,
      subject:req.body.subject,
      message:req.body.message,
      forward:false,
      reply:false,
      starred:false,
      date:today,
      time:time
    });

    db.collection(user1).insertOne({
      recieved_mail:decodedToken.email,
      subject:req.body.subject,
      message:req.body.message,
      seen:false,
      starred:false,
      date:today,
      time:time

    });

    return res.status(200).send({"message":"sucess"});

      }
    })
  });




router.get('/inbox',function(req,res){

  let token = req.body.token;
  jwt.verify(token,'secret', function(err, tokendata){
    if(err){
      return res.status(400).send({"message":token});
    }
    if(tokendata){
      decodedToken = tokendata;
      const user=decodedToken.email+'_recieved';
      // res.send(['hii','hello']);
      db.collection(user).find().toArray(function(err,views){
        if(err)
          console.log(err);
        else
          res.send({"views":views});
      });
    }
  });
});

router.get('/sent',function(req,res){
  let token = req.body.token;
  jwt.verify(token,'secret', function(err, tokendata){
    if(err){
      return res.status(400).send({"message":"Unauthorized request"});
    }
    if(tokendata){
      decodedToken = tokendata;
      const user=decodedToken.email+'_composed';
      db.collection(user).find().toArray(function(err,views){
        if(err)
          console.log(err);
        else
        res.send({"views":views});
      });
    }
  });

});
















router.get('/username', verifyToken, function(req,res,next){
  return res.status(200).send({"email":decodedToken.email});
})

var decodedToken='';
function verifyToken(req,res,next){
  let token = req.body.token;

  jwt.verify(token,'secret', function(err, tokendata){
    if(err){
      return res.status(400).send({"message":"Unauthorized request"});
    }
    if(tokendata){
      decodedToken = tokendata;
      next();
    }
  })
}



module.exports = router;
