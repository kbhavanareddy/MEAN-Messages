var express = require('express'),
    app=express();
var mongoose=require('mongoose');
var bodyParser=require('body-parser');
var cors=require('cors');
    mongoose.Promise=require('q').Promise;


app.use(cors());

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(express.static('public')); 

mongoose.connect('mongodb://localhost:27017/jobs');
var db=mongoose.connection;

//---------------------------------------------

db.on('error',function(){
    console.log('error');

});
db.on('open',function(){
    console.log('connection established!!');

});

//----------------------------------------------

//create schema
var user_schema = new mongoose.Schema({
    username:String,
    password:String,
    firstname:String,
    lastname:String,
    email:String,
    location:String,
    phone:Number
});

var msg_schema = new mongoose.Schema({

    recipient:String,
    recipient_img:String,
    sender:String,
    sender_img:String, 
    title:String,
    description:String,
    created:String,
    important:String,
    favourite:{
        type:Boolean,
        default:false
    },
    replys:[String]

},{collection:'message'});


// //create model
var user_model= mongoose.model('users',user_schema);
var msg_model=mongoose.model('message',msg_schema);



//registration-------------------------------------------------

app.post('/register',function(req,resp){

    var newUser={
        username:req.body.registerform.username,
        password:req.body.registerform.password,
        firstname:req.body.registerform.firstname,
        lastname:req.body.registerform.lastname,
        email:req.body.registerform.email,
        location:req.body.registerform.location,
        phone:req.body.registerform.phone
    }

    new user_model(newUser).save().then(function(userdata){

        resp.send(true);
    });

});



//login---------------------------------------------------------

app.post('/login',function(req,resp){

    user_model.findOne({username:req.body.loginform.username})
    .then((userdata) =>{
        if(userdata.username==req.body.loginform.username && userdata.password==req.body.loginform.password){
    //console.log(userdata);
            resp.send(userdata);
        }
        else
            {
                resp.send(false);
            }
            
    });
});





//update----------------------------------------

app.post('/update',function(req,resp){

    user_model.findOne({username:req.body.username})
    .then(userdata=>{
        console.log(userdata);
        userdata.username=req.body.username,
        userdata.password=req.body.password,
        userdata.firstname=req.body.firstname,
        userdata.lastname=req.body.lastname,
        userdata.email=req.body.email,
        userdata.location=req.body.location,
        userdata.phone=req.body.phone

        userdata.save().then(userdata=>{

            resp.send(userdata);
        });
    });
});




//messages------------------------------------------------

app.get('/messages/:user',function(req,resp){

   // console.log({recipient:req.params.user});

    msg_model.find({recipient:req.params.user})
    .then(msgs=>{
        //console.log(msgs);
        resp.send(msgs);
    }).catch(()=>{
        resp.send("no messages");
    })
});


//profile of same user------------------------------------------------

app.get('/users/:user',function(req,resp){
    
 

    user_model.findOne({username:req.params.user})
    .then(user=>{
        
        resp.send(user);
        
    }).catch(()=>{
        resp.send("user not defined");
    })

});


//to get infm of particular user--------------------------------------------
app.get('/detailmsgs/:id',function(req,resp){
    
//console.log(req.params.id);

    msg_model.find({_id:req.params.id})
    .then(msgs=>{
         //console.log(msgs);

        resp.send(msgs);
    })
    .catch((err)=>{

        resp.send('no messages');
    })

});




//favorite--------------------------------------------------------

app.get('/favourite/:id',function(req,res){

    msg_model.findOne({_id:req.params.id})
    .then(msgs=>{
        //console.log(msgs);
    msgs.favourite = true;

    msgs.save().then(function(msg){
      res.send(msg);
     })
    }).catch(()=>{
      res.send("no messages");
    })
  
  });



//delete message------------------------------------------------------

app.get('/delete/:id',function(req,resp){

    msg_model.find({_id:req.params.id}).remove(msgs=>{
      resp.send(true);

    })
    .catch(()=>{
      res.send("no message deleted");
    })
  
});


//reply--------------------------------------------------

app.post('/reply/:id',function(req,res){

    //console.log(req.params.id);
    msg_model.findOne({_id:req.params.id})
    .then(msgs=>{
        //console.log(req.body.reply);
        //console.log(msgs);
       msgs.replys.push(req.body.reply);

      msgs.save().then(msg => {
        //console.log(msg);
       res.send(msg);
      })
    }).catch(()=>{
      res.send("no messages");
    })
  });
 




//---------------------------------------------

app.get('/',function(req,resp){

    resp.sendFile(__dirname+'/meanstack1.html');
})



app.listen(3000,function(){
    console.log("server running @localhost:3000")
})