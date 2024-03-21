var express = require("express");
var app = express();
var bodyparser = require("body-parser");

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
var main = require("./main");
app.set("view engine", "ejs");
app.set("views", "./views");

app.listen("3000", () => {
  console.log("Server Started");
});
app.use("/", main);

