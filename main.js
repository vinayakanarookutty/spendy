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

//Different Routes


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
        res.redirect(`/home?id=${user._id}`);
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
 
  

  var budget = 0
  if(user?.budget!=null)
  {
    budget = user.budget
   
  }
  // Set user details in local storage
  res.render("home", { user: user, budget: budget ,userId:userIdFromQuery,eventDetails});
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
    res.redirect(`/home?id=${req.body.userId}`);
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
    res.redirect(`/home?id=${req.body.userId}`);
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
  res.redirect(`/home?id=${req.body.userId}`);

  
});








 
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
      res.redirect(`/home?id=${userIdFromQuery}`);
    } catch (error) {
      // Handle any errors that might occur during the process
      console.error("Error creating user:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  



//Home Routes for Displaying HomePage Page

  module.exports = router