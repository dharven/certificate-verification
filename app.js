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
      makeCertificate(v);
      // console.log(cs);
    }); // identifying name
  function makeCertificate(name) {
    jimp.read("./Data/0001.jpg", (err, c) => {
      if (err) throw err;
      jimp.loadFont(jimp.FONT_SANS_128_BLACK).then((font) => {
        console.log("Inside");
        c.print(font, 1270, 880, {
          text: name,
          // alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
          // alignmentY: jimp.VERTICAL_ALIGN_MIDDLE,
        });
      });
      jimp
        .loadFont(jimp.FONT_SANS_32_BLACK)
        .then((font) => {
          c.print(font, 10, 10, {
            text: "bhargav",
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

  function generateCertificateNumber() {}
  res.send("Done");
});

app.listen(3000);
