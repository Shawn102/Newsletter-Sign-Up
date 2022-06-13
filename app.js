// Importing the fundamental packages
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const https = require("https");

//creating the express app
const app = express();

//Using the require package to my 'app';
//This bodyParser for accessing the html in backend server
app.use(bodyParser.urlencoded({ extended: true }));

// And this 'express.static()' for accessing all the file that related to front end design
app.use(express.static("public"));

// Creating the home route for my server to interact
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

// Creating a 'post' request for my home route
app.post("/", (req, res) => {
  // accessing the 'signup.html' page inputs
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email;

  //Creating a js object that will convert to json later and will send to mailchimp
  const Data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };

  // Converting the 'Data' to 'json data'
  const jsonData = JSON.stringify(Data);

   //Accessing the 'list id', 'api key', 'host name' from '.env' file
   const key = process.env.KEY;
   const serCen = process.env.SERVER;
   const liId = process.env.ID;

  //mailchimp url
  const url = `https://${serCen}.api.mailchimp.com/3.0/lists/${liId}`;

  const options = {
    method: "POST",
    auth: `shawn:${key}`,
  };

  //Making an 'https' request to "Mailchimps api"
  const myRequest = https.request(url, options, (response) => {
    //Checking the status code of response and taking next action according to it
    if (response.statusCode === 200) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }

    // now checking what they send back from their api
    response.on("data", (data) => {
      console.log(JSON.parse(data));
    });
  });

  //sending our data to 'mailchimps'
  myRequest.write(jsonData);
  myRequest.end();
});

// Creating another post request to 'redirect' home page
app.post("/redirect", (req, res) => {
  res.redirect("/");
});

// Creating a variable for the 'port'
const Port = 5000;
// Creating my server port to listen that server
app.listen(process.env.PORT || Port, () => {
  console.log(`Your app started on port ${Port}`);
});
