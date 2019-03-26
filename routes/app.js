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
        return res.status(501).send({token:""});
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


router.post('/validateEmail',function(req,res){
  db.collection('pmail_users').find({"email":req.body.email}).toArray(function(err,mails){
    if(err)
    console.log(err);
  else
    res.send({"mails":mails});
  });
});

router.post('/validatePhone',function(req,res){
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
var mm1 = today.getMonth() + 1; //January is 0!
var yyyy = today.getFullYear();
if (dd < 10) {
  dd = '0' + dd;
}
if (mm1 < 10) {
  mm1 = '0' + mm1;
}
var today = dd + '/' + mm1 + '/' + yyyy;
var time = (hh+5) + ":" + (mm+30) + ":" + ss;

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

  router.post('/getdetails',function(req,res){
    let token = req.body.token;
  jwt.verify(token,'secret', function(err, tokendata){
    if(err){
      return res.status(400).send({"message":"Unauthorized request"});
    }
    if(tokendata){
      decodedToken = tokendata;
      const email=decodedToken.email;
      db.collection('pmail_users').find({email:email}).toArray(function(err,person){
        if(err)
          console.log(err);
        else
          res.send({"person":person});
      });
    }
  });
  });

  router.post('/update',function(req,res){
    let token = req.body.token;
    jwt.verify(token,'secret', function(err, tokendata){
      if(err){
        return res.status(400).send({"message":"Unauthorized request"});
      }
      if(tokendata){
        decodedToken = tokendata;
        const email=decodedToken.email;
        let first_name=req.body.first_name;
        let last_name=req.body.last_name;
        let phone_no=req.body.phone_no;

        db.collection('pmail_users').findAndModify(
          {email:email},
          [['_id','asc']],  // sort order
          {"$set": {first_name:first_name,last_name:last_name,phone_no:phone_no}},
          {"upsert":false}, // options
          function(err, object) {
              if (err){
                  console.log(err);  // returns error if no matching object found
              }else{
                  res.send({"message":"ok"});
              }
          });
        }
      });


  });


  router.post('/getStarred',function(req,res){
    let token = req.body.token;
    jwt.verify(token,'secret', function(err, tokendata){
      if(err){
        return res.status(400).send({"message":token});
      }
      if(tokendata){
        decodedToken = tokendata;
        const user=decodedToken.email+'_composed';
        const user1=decodedToken.email+'_recieved';
        
        db.collection(user).find({starred:true}).toArray(function(err,mails){
          if(err)
            console.log(err);
          else
          {
          db.collection(user1).find({starred:true}).toArray(function(err,mail){
            console.log("ckeck1");
            
          if(err)
            console.log(err);
          else
          {
            console.log("ckeck2");
            mail.forEach(function(item){
                console.log("ckeck3");
                mails.push(item);
                console.log("hi");
              });
              res.send({"mails":mails});
          }
        });
        
      }
    });
  }
    });
  });


  router.post('/starred',function(req,res){
    let token = req.body.token;
    jwt.verify(token,'secret', function(err, tokendata){
      if(err){
        return res.status(400).send({"message":token});
      }
      if(tokendata){
        decodedToken = tokendata;
        const user=decodedToken.email+'_composed';
        const user1=decodedToken.email+'_recieved';
        let msg=req.body.message;
        let sub=req.body.subject;
        let t=req.body.choice;
        let person=req.body.person;
      
          console.log("hi");
          if(t=="1"){
          db.collection(user).findAndModify(
            {reciever:person,subject:sub,message:msg},
            [['_id','asc']],  // sort order
            {"$set": {"starred": true}},
            {"upsert":false}, // options
            function(err, object) {
                if (err){
                    console.log(err);  // returns error if no matching object found
                }else{
                    res.send({"message":"ok"});
                }
              }
            )
            }
        else if(t=="0"){
          db.collection(user1).findAndModify(
            {recieved_mail:person,subject:sub,message:msg},
            [['_id','asc']],  // sort order
            {"$set": {"starred": true}},
            {"upsert":false}, // options
            function(err, object) {
                if (err){
                    console.log(err);  // returns error if no matching object found
                }else{
                    res.send({"message":"ok"});
                }
              }
            )
        }
      }
    });
  });

    



  
  router.post('/seen',function(req,res){
    let token = req.body.token;
    jwt.verify(token,'secret', function(err, tokendata){
      if(err){
        return res.status(400).send({"message":token});
      }
      if(tokendata){
        decodedToken = tokendata;
        const user=decodedToken.email+'_recieved';
        let msg=req.body.message;
        let sub=req.body.subject;
        let person=req.body.person;
      
          db.collection(user).findAndModify(
            {recieved_mail:person,subject:sub,message:msg},
            [['_id','asc']],  // sort order
            {"$set": {"seen": true}},
            {"upsert":false}, // options
            function(err, object) {
                if (err){
                    console.log(err);  // returns error if no matching object found
                }else{
                    res.send({"message":"ok"});
                }
              }
            )
            }
    });
  });



  router.post('/getSeen',function(req,res){
    let token = req.body.token;
    jwt.verify(token,'secret', function(err, tokendata){
      if(err){
        return res.status(400).send({"message":token});
      }
      if(tokendata){
        decodedToken = tokendata;
        const user1=decodedToken.email+'_recieved';
          db.collection(user1).find({seen:true}).toArray(function(err,mail){
          if(err)
            console.log(err);
          else
          {
              res.send({"mails":mail});
          }
        });
        
      }
    });
  });
  








router.post('/inbox',function(req,res){

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

router.post('/sent',function(req,res){
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
        res.send({"views":""});
        else
        res.send({"views":views});
      });
    }
  });

});




router.post('/email',function(req,res){
    var mail=req.body.email;
      db.collection('pmail_users').find({"email":mail}).toArray(function(err,user){
        if(err){
          console.log(err);
        }
        else{
          res.send({"phone_no":user});
        }
      })

})

router.post('/update_pass',function(req,res){
  var mail=req.body.mail;
  db.collection('pmail_users').findAndModify(
    {email:mail},
    [['_id','asc']],  // sort order
    {"$set": {"password": User.hashPassword(req.body.password)}},
    {"upsert":false}, // options
    function(err, object) {
        if (err){
            console.log(err);  // returns error if no matching object found
        }else{
            res.send({"message":"ok"});
        }
    });
})


router.post('/deleteInb',function(req,res){
  let token = req.body.token;
  jwt.verify(token,'secret', function(err, tokendata){
    if(err){
      return res.status(400).send({"message":"Unauthorized request"});
    }
    if(tokendata){
      decodedToken = tokendata;
      const user=decodedToken.email+'_recieved';

      db.collection(user).find({subject:req.body.subject,message:req.body.message}).toArray(function(err,views){
        if(err)
          console.log(err);
        else{
          const tr=decodedToken.email+'_trash';
          
          db.collection(tr).insertOne(views.pop());
        }
      }
        );

      db.collection(user).deleteMany({subject:req.body.subject,message:req.body.message},function(err,views){
        if(err)
          console.log(err);
        else{
        res.send({"message":"ok"});
        }
      })
    }
  });
});



router.post('/deleteCom',function(req,res){
  let token = req.body.token;
  jwt.verify(token,'secret', function(err, tokendata){
    if(err){
      return res.status(400).send({"message":"Unauthorized request"});
    }
    if(tokendata){
      decodedToken = tokendata;
     
      db.collection(user).deleteMany({subject:req.body.subject,message:req.body.message},function(err,views){
        if(err)
          console.log(err);
        else{
        res.send({"message":"ok"});
        }
      })
    }
  });
});



router.post('/gettrash',function(req,res){
  let token = req.body.token;
  jwt.verify(token,'secret', function(err, tokendata){
    if(err){
      return res.status(400).send({"message":"Unauthorized request"});
    }
    if(tokendata){
      decodedToken = tokendata;
      const user=decodedToken.email+'_trash';
      db.collection(user).find().toArray(function(err,views){
        if(err)
          console.log(err);
        else{
          res.send({"mails":views});
        }
      });

    }
  });
});



router.post('/deletetrash',function(req,res){
  let token = req.body.token;
  jwt.verify(token,'secret', function(err, tokendata){
    if(err){
      return res.status(400).send({"message":"Unauthorized request"});
    }
    if(tokendata){
      decodedToken = tokendata;
      const user=decodedToken.email+'_trash';
      db.collection(user).deleteMany({subject:req.body.subject,message:req.body.message},function(err,views){
        if(err)
          console.log(err);
        else{
        res.send({"message":"ok"});
        }
      })
    }
  });
});





router.post('/deleteAcc',function(req,res){
  let token = req.body.token;
  jwt.verify(token,'secret', function(err, tokendata){
    if(err){
      return res.status(400).send({"message":"Unauthorized request"});
    }
    if(tokendata){
      decodedToken = tokendata;
      const user=decodedToken.email;
      db.collection('pmail_users').deleteOne({email:user},function(err,us){
        if(err)
        console.log(err);
        else{
          const user1=user+'_recieved';
          const user2=user+'_composed';
          db.dropCollection(user1);
          db.dropCollection(user2);
        res.send({"message":"ok"});
        }
      })
    }
})
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
