const { json } = require("body-parser");
var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
const Schema = mongoose.Schema;
// MongoDB Connection to cloud database
mongoose.connect(
  "mongodb+srv://vinayaksukhalal:12344321@cluster0.mcgbpy6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
).then(()=>{
    console.log("DB Connected")
});

//Schema of the User
var userSchema = mongoose.Schema({
  name: String,
  email: String,
  phone: Number,
  password: String,
  budget:Number
});

var goalSchema = mongoose.Schema({
  goalName: String,
  expectedPrice: Number,
  date:Date,
  user:{ type: Schema.Types.ObjectId, ref: 'user' }
},{strict:false}, { timestamps: true });


const WorkshopSchema = new mongoose.Schema({
  email: String,
  name: String,
  phone: String,
  experienceLevel: String,
  hearAboutUs: String,
  specialRequirements: String,
},{strict:false});


var eventSchema = mongoose.Schema({
  eventName: String,
  eventDescription: String,
  expectedRate: Number,
  actualRate: Number,
  combinedItems:Array,
  date:Date,
  user: { type: Schema.Types.ObjectId, ref: 'user' }
},{strict:false}, { timestamps: true });

// Registering schema to mongoose
var UserModal = mongoose.model("user", userSchema);
var EventModal = mongoose.model("events", eventSchema);
var GoalModal=mongoose.model("goals",goalSchema)
const Workshop = mongoose.model('workshop', WorkshopSchema);
//Different Routes


router.post('/registration', async (req, res) => {
  try {
    const newUser = new Workshop(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save user data' });
  }
});

// Route to retrieve all users
router.get('/List', async (req, res) => {
  try {
    const users = await Workshop.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

//Login Routes for Displaying Login Page
router.get("/", (req, res) => {
  res.render("login" ,{ status: "" });
});

//SignUP Routes for Displaying SignUp Page
router.get("/signup", (req, res) => {
  res.render("registration");
});

router.post("/signup", async (req, res) => {
  try {
    console.log(req.body)
    
    var user = new UserModal({
      name: req.body.name,
      email:  req.body.email,
      phone: req.body.phone,
      password: req.body.password,
    });

    // Save the user and wait for the operation to complete
    await user.save();

    // Redirect after the user is successfully saved
    res.redirect("/");
  } catch (error) {
    // Handle any errors that might occur during the process
    console.error("Error creating user:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/flutter/login", async (req, res) => {
  console.log(req.body);
  var user = await UserModal.findOne({ email: req.body.email });
  console.log(user)
  if (user) {
      if (user.password == req.body.password) {
        email = user.email;
        let userDetails=JSON.stringify(user)
        res.status(200).send(userDetails)
      } else {
   
        res.status(404).json("Password is Wrong")
      }
  } else {
   
    res.status(404).json("UserNane is Wrong")
  }
});


router.post("/login", async (req, res) => {
  console.log(req.body);
  var user = await UserModal.findOne({ email: req.body.email });
  console.log(user)
  if (user) {
      if (user.password == req.body.password) {
        email = user.email;
        res.redirect(`/home?id=${user._id}&msg=`);
        // res.json("Login Succesfull",user)
      } else {
        res.render("login", { status: "Password is Wrong" });
        // res.status(404).json("Password is Wrong")
      }
  } else {
    res.render("login", { status: "UserName is Wrong" });
    // res.status(404).json("UserNane is Wrong")
  }
});


router.get("/home", async (req, res) => {
  const userIdFromQuery = req.query.id;
  console.log(userIdFromQuery);
  var user = await UserModal.findOne({ _id: userIdFromQuery });
  var eventDetails = await EventModal.find({ user: userIdFromQuery });
  console.log(eventDetails)

  console.log(req.query.msg)
  msg = req.query.msg
  let snack=""
  if (msg) {
    if (msg=="budget") {
      snack = "Budget updated succesfully!"
    } else if (msg=="event") {
      snack = "Event added succesfully!"
    }
  }
  console.log(snack)
  

  var budget = 0
  if(user?.budget!=null)
  {
    budget = user.budget
   
  }
  // Set user details in local storage
  res.render("home", { user: user, budget: budget ,userId:userIdFromQuery,eventDetails, snack: snack});
});

router.get("/flutter/home", async (req, res) => {
  const userIdFromQuery = req.query.id;
  console.log(userIdFromQuery);
  var user = await UserModal.findOne({ _id: userIdFromQuery });
  var eventDetails = await EventModal.find({ user: userIdFromQuery });
  console.log(eventDetails)
  

  var budget = 0
  if(user?.budget!=null)
  {
    budget = user.budget
   
  }
  let userDetails=JSON.stringify(eventDetails)
  res.status(200).send(userDetails)
  // Set user details in local storage
 
});


router.post("/budget", async (req, res) => {
  try {

   var user = await UserModal.findOne({ _id:req.body.userId  });
   if(user.budget)
   {
    let budget=user.budget
    if(req.body.increaseAmount)
   {
    let increment=parseInt(req.body.increaseAmount)
    budget=budget+increment
   }
   else if(req.body.decreaseAmount){
    let decrement=parseInt(req.body.decreaseAmount)
    budget=budget-decrement
   }
  
    const updatedUser = await UserModal.findOneAndUpdate(
      { _id: req.body.userId }, // Find user by email
      { $set: { budget:budget } }, // Specify the fields to update
      { new: true } // To return the updated document
    );
   console.log(updatedUser)

    // Save the user and wait for the operation to complete


    // Redirect after the user is successfully saved
    res.redirect(`/home?id=${req.body.userId}&msg=budget`);
   }
   else{
    let budget=0
    if(req.body.increaseAmount)
   {
    let increment=parseInt(req.body.increaseAmount)
    budget=increment
   }
   else if(req.body.decreaseAmount){
    let decrement=parseInt(req.body.decreaseAmount)
    budget=decrement
   }
  
    const updatedUser = await UserModal.findOneAndUpdate(
      { _id: req.body.userId }, // Find user by email
      { $set: { budget:budget } }, // Specify the fields to update
      { new: true } // To return the updated document
    );
   console.log(updatedUser)

    // Save the user and wait for the operation to complete


    // Redirect after the user is successfully saved
    res.redirect(`/home?id=${req.body.userId}&msg=budget`);
   }
  
   
  } catch (error) {
    // Handle any errors that might occur during the process
    console.error("Error creating user:", error);
    res.status(500).send("Internal Server Error");
  }
});


router.post("/addEvent", async (req, res) => {
  // const userId = req.params.id;
  // const user = await UserModal.findOne(
  //   { _id: userId });
  // res.render("addEvent");
  const itemNames = req.body.itemName;
  const itemQuantities = req.body.itemQuantity;
  const items = itemNames.map((itemName, index) => ({
    name: itemName,
    quantity: itemQuantities[index]
  }));



  
const date=new Date()
console.log(date)
  var events = new EventModal({
  eventName: req.body.category,
  eventDescription:req.body.description,
  combinedItems:items,
  expectedRate: req.body.price,
  user: req.body.userId,
  date:date
  });
  events.save();
  res.redirect(`/home?id=${req.body.userId}&msg=event`);

  
});


router.post("/flutter/spent", async (req, res) => {
  try {
    console.log(req.body)
    const eventIdFromQuery = req.body.eventId;
    const userIdFromQuery=req.body.userId;
    const spend=parseInt(req.body.spend)
    const updatedEvent = await EventModal.findOneAndUpdate(
      { _id: eventIdFromQuery }, // Find user by email
      { $set: { actualRate:spend } }, // Specify the fields to update
      { new: true } // To return the updated document
    );


  
   
   const updatedUser = await UserModal.findOneAndUpdate(
    { _id:userIdFromQuery }, // Find user by email
    { $inc: { budget:-spend } }, // Specify the fields to update
    { new: true } // To return the updated document
  );
    // Redirect after the user is successfully saved
    
    res.status(200).json("Data Edited Succesfully")
  } catch (error) {
    // Handle any errors that might occur during the process
    console.error("Error creating user:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/analysis', async (req,res) => {
  const userIdFromQuery = req.query.id;
  console.log(userIdFromQuery);
  var user = await UserModal.findOne({ _id: userIdFromQuery });
  var events = await EventModal.find({ user: userIdFromQuery });
  console.log(events)
  const arrayOfArrays = events.map(event => {
    return [
      event.date.toDateString(),
      event.expectedRate,
      event.actualRate,
    ];
  });
  
  
  var array=["","Expected","Spend"]

 
 arrayOfArrays.unshift(array)
 console.log(arrayOfArrays);

  res.render('analysis', {user: user,arrayOfArrays,eventArray:events})
})


  router.post("/spent", async (req, res) => {
    try {
      console.log(req.body)
      const eventIdFromQuery = req.body.eventId;
      const userIdFromQuery=req.body.userId;
      const spend=parseInt(req.body.spend)
      const updatedEvent = await EventModal.findOneAndUpdate(
        { _id: eventIdFromQuery }, // Find user by email
        { $set: { actualRate:spend } }, // Specify the fields to update
        { new: true } // To return the updated document
      );


    
     
     const updatedUser = await UserModal.findOneAndUpdate(
      { _id:userIdFromQuery }, // Find user by email
      { $inc: { budget:-spend } }, // Specify the fields to update
      { new: true } // To return the updated document
    );
      // Redirect after the user is successfully saved
      res.redirect(`/home?id=${userIdFromQuery}&msg=`);
    } catch (error) {
      // Handle any errors that might occur during the process
      console.error("Error creating user:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  router.post("/events/:id", async (req, res) => {
    try {
      console.log(req.params.id)
      
      const userId = req.params.id;
      const user = await UserModal.findOne(
        { _id: userId });
     
      var event = new EventModal({
        eventName: req.body.eventName,
        eventDescription: req.body.eventDesc,
        expectedRate: req.body.expectedRate,
        user:user._id
      });
  
      // Save the user and wait for the operation to complete
      await event.save();
  
      // Redirect after the user is successfully saved
      res.redirect(`/home?email=${user.email}`);
    } catch (error) {
      // Handle any errors that might occur during the process
      console.error("Error creating user:", error);
      res.status(500).send("Internal Server Error");
    }
  });


router.post("/login", async (req, res) => {
  console.log(req.body);
  var user = await UserModal.findOne({ email: req.body.email });

  if (user) {
    bcrypt.compare(req.body.password, user.password).then((response) => {
      if (response) {
        email = user.email;
        res.redirect(`/home?email=${user.email}`);
      } else {
        res.render("login", { status: "Password is Wrong" });
      }
    });
  } else {
    res.render("login", { status: "UserName is Wrong" });
  }
});

//Home Routes for Displaying HomePage Page


router.get('/goals', async (req,res) => {
  const userIdFromQuery = req.query.id;
  console.log(userIdFromQuery);
  var user = await UserModal.findOne({ _id: userIdFromQuery });
  // var eventDetails = await EventModal.find({ user: userIdFromQuery });
  // console.log(eventDetails)

  console.log(req.query.msg)
  msg = req.query.msg
  let snack=""
  if (msg) {
    if (msg=="budget") {
      snack = "Budget updated succesfully!"
    } else if (msg=="event") {
      snack = "Event added succesfully!"
    }
  }
  console.log(snack)
  

  var budget = 0
  if(user?.budget!=null)
  {
    budget = user.budget
   
  }
  

  res.render('goals', {user: user,budget: budget , snack: snack})
})


router.post("/addgoal", async (req, res) => {
 

const date=new Date()
console.log(date)
  var events = new EventModal({
  eventName: req.body.category,
  eventDescription:req.body.description,
  combinedItems:items,
  expectedRate: req.body.price,
  user: req.body.userId,
  date:date
  });
  events.save();
  res.redirect(`/home?id=${req.body.userId}&msg=event`);

  
});



  module.exports = router