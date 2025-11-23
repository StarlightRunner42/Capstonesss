require("dotenv").config();
const path = require("path");
const express = require("express"); 
const bodyParser = require("body-parser");
const routes = require("./routes/routes");
const connection = require("./model/database");
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the templating engine
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "default"));

// Middleware to serve static files
app.use(express.static(path.join(__dirname, "files")));

// Middleware to parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET, // Change this to a strong, random string
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

//database connection
connection();

// Import routes
app.use("/", routes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

//hosted
// app.listen(PORT, '0.0.0.0',() => {
//     console.log(`Server is running`);
// });


// To do:



//add Generate report on all table

//staff_addSenior fix where contact relationship cannot be empty

//pwd make email optional

