var express = require("express");
var app = express();
var bodyparser = require("body-parser");
const cors = require('cors');
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
var main = require("./main");
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(cors());
// Serve static files from the 'public' directory
app.use(express.static("public"));

app.listen("3000", () => {
  console.log("Server Started");
});
app.use("/", main);

