var express = require("express");
var fileUpload = require("express-fileupload");
var csv = require("csv-parser");
var fs = require("fs");
var jimp = require("jimp");

var app = express();
app.use(fileUpload());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/assets"));

app.get("/", function (req, res) {
  res.render("index");
});

app.post("/generate", function (req, res) {
  var f = req.files.f;
  f.mv(__dirname + "/tmp/" + f.name, function () {});
  console.log(__dirname);

  fs.createReadStream("./tmp/" + f.name)
    .pipe(csv())
    .on("data", (row) => {
      console.log(row.fname + " " + row.lname);
    }); // identifying name

  jimp.read("./Data/0001.jpg", (err, c) => {
    if (err) throw err;
    jimp
      // .loadFont(jimp.FONT_SANS_128_BLACK)
      .loadFont("./Data/Montserrat-BoldItalic.ttf")
      .then((font) => {
        console.log("Inside");
        c.print(font, 10, 10, {
          text: "Hello AB",
        }).write("abc.jpg", () => {
          console.log("Doneeee");
        });
      })
      .catch((err) => {
        console.log("It's Okay");
      });
  });
});
app.listen(3000);
