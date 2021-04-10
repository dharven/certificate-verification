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
  var cs = [];
  fs.createReadStream("./tmp/" + f.name)
    .pipe(csv())
    .on("data", (row) => {
      var v = row.fname + " " + row.lname;
      abc(v);
      // console.log(cs);
    }); // identifying name
  function abc(name) {
    jimp.read("./Data/0001.jpg", (err, c) => {
      if (err) throw err;
      jimp
        .loadFont(jimp.FONT_SANS_128_BLACK)
        .then((font) => {
          console.log("Inside");
          c.print(font, 1320, 950, {
            text: name,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
          });
          c.write(name + ".jpg", () => {
            console.log("Doneeee");
          });
        })
        .catch((err) => {
          console.log("It's Okay");
        });
    });
  }
  res.send("Done");
});

app.listen(3000);
