var express = require("express");
var fileUpload = require("express-fileupload");
var csv = require("csv-parser");
var fs = require("fs");
var jimp = require("jimp");
var config = require("./config");
var firebase = require("./db");
var firestore = firebase.firestore();

var app = express();
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(fileUpload());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/assets"));

app.get("/", function (req, res) {
  // console.log(config.firebaseConfig);
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
      var cnumber = generateCertificateNumber();
      firestore
        .collection("certificates")
        .doc()
        .set({ certificateNumber: cnumber, name: v, profile: row.profileName });
      makeCertificate(v, cnumber);
      // console.log(cs);
    }); // identifying name
  function makeCertificate(name, cnumber) {
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
          c.print(font, 70, 2000, {
            text: "Certificate Number: " + cnumber,
          });
          c.print(font, 70, 2050, {
            text: "For certificate authentication please visit",
          });
          c.write(__dirname + "/certificates/" + name + ".jpg", () => {
            console.log("Doneeee");
          });
        })
        .catch((err) => {
          console.log("It's Okay");
        });
    });
  }

  function generateCertificateNumber() {
    var p = Math.random().toString(36).slice(2);
    var q = Math.random().toString(36).slice(2);
    var r = Math.random().toString(36).slice(2);

    var arr = [p, q, r];
    var cnumbers = [];
    var final = arr.join("-");
    firestore
      .collection("certificates")
      .get()
      .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
          cnumbers.push(doc.data().certificateNumber);
        });
      });
    if (final in cnumbers) {
      generateCertificateNumber();
    }
    return final;
  }
  res.send("Done");
});

app.get("/verify", function (req, res) {
  res.render("verify", { name: null, profile: null, certificateNumber: null });
});

app.post("/verify", function (req, res) {
  // console.log(req.body.cnum);
  firestore
    .collection("certificates")
    .where("certificateNumber", "==", req.body.cnum)
    .get()
    .then((snapshot) => {
      if (snapshot.docs.length == 0) {
        res.send("Invalid Number");
      }
      snapshot.docs.forEach((doc) => {
        var name = doc.data().name;
        var profile = doc.data().profile;
        res.render("verify", {
          name: name,
          profile: profile,
          certificateNumber: req.body.cnum,
        });
      });
    });
});

app.listen(3000);
