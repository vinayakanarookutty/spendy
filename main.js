var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var bcrypt = require("bcrypt");
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
  mobileNo: Number,
  password: String,
  budget:Number
});
var eventSchema = mongoose.Schema({
  eventName: String,
  eventDescription: String,
  expectedRate: Number,
  actualRate: Number,
  user: { type: Schema.Types.ObjectId, ref: 'user' }
});

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


router.get("/addEvent", async (req, res) => {
  // const userId = req.params.id;
  // const user = await UserModal.findOne(
  //   { _id: userId });
  res.render("addEvent");
});

router.post('/submit-form', (req, res) => {
  const category = req.body.category;
  const description = req.body.description;
  const itemNames = req.body.itemName;
  const itemQuantities = req.body.itemQuantity;

  // Combine item names and quantities into an array of objects
  const items = itemNames.map((itemName, index) => ({
    name: itemName,
    quantity: itemQuantities[index]
  }));
req.body.addList=items
  console.log('Body:', req.body);
  

  // Send a response
  res.send('Form submitted successfully!');
});

router.get('/analysis/:id', async (req,res) => {
  const userId = req.params.id;
  const user = await UserModal.findOne(
    { _id: userId });
    var eventDetails = await EventModal.find({ user: userId });
  res.render("analysis",{user: user,eventArray:eventDetails})
})

router.post("/signup", async (req, res) => {
    try {
      
      var password = await bcrypt.hash(req.body.password, 10);
      var user = new UserModal({
        name: req.body.name,
        email:  req.body.email,
        mobileNo: req.body.mobileNo,
        password: password,
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


  router.post("/budget", async (req, res) => {
    try {

      const userIdFromQuery = req.query.id;
      const budget=req.body.budget
      console.log(budget)
      const updatedUser = await UserModal.findOneAndUpdate(
        { _id: userIdFromQuery }, // Find user by email
        { $set: { budget:budget } }, // Specify the fields to update
        { new: true } // To return the updated document
      );
     console.log(updatedUser)
  
      // Save the user and wait for the operation to complete
 
  
      // Redirect after the user is successfully saved
      res.redirect(`/home?email=${updatedUser.email}`);
    } catch (error) {
      // Handle any errors that might occur during the process
      console.error("Error creating user:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  router.post("/spent", async (req, res) => {
    try {
      
      const eventIdFromQuery = req.query.id;
      const spent=req.body.spent
      console.log(spent)
      const updatedEvent = await EventModal.findOneAndUpdate(
        { _id: eventIdFromQuery }, // Find user by email
        { $set: { actualRate:spent } }, // Specify the fields to update
        { new: true } // To return the updated document
      );
     console.log(updatedEvent)
     userId=updatedEvent.user
     const updatedUser = await UserModal.findOneAndUpdate(
      { _id: userId }, // Find user by email
      { $inc: { budget:-spent } }, // Specify the fields to update
      { new: true } // To return the updated document
    );
      // Redirect after the user is successfully saved
      res.redirect(`/home?email=${updatedUser.email}`);
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
router.get("/home", async (req, res) => {
    const userEmailFromQuery = req.query.email;
    console.log(userEmailFromQuery);
    var user = await UserModal.findOne({ email: userEmailFromQuery });
    var userId=user?._id
    console.log(userId)
    var eventDetails = await EventModal.find({ user: userId });
    console.log(eventDetails)

    var budget = 0
    if(user?.budget!=null)
    {
      budget = user.budget
    }
    // Set user details in local storage
    res.render("home", { user: user,event: eventDetails, budget: budget });
  });
  module.exports = router