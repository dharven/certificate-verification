var express = require("express");
var fileUpload = require("express-fileupload");
var csv = require("csv-parser");
var fs = require("fs");

var app = express();
app.use(fileUpload());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/assets"));

app.get("/", function (req, res) {
  res.render("index");
});

app.post("/generate", function (req, res) {
  var f = req.files.f;
  console.log(f.name);

  fs.createReadStream(f.name)
    .pipe(csv())
    .on("data", (row) => {
      console.log(row.fname);
    })
    .on("end", () => {
      console.log("CSV file successfully processed");
    });
});
app.listen(3000);
