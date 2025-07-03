const mysql = require("mysql2");           
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const {v4: uuidv4} = require("uuid"); 
const session = require("express-session");

app.use(session({
  secret: "secret_key",
  resave: false,
  saveUninitialized: true
}));

const port = 8080;

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended : true}));
app.set("view engine","ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));      


const db = mysql.createConnection({      
  host: 'localhost',
  user: 'root',
  database: 'dt_project',
  password: 'Black@pink4'
});


app.get("/", (req, res) => {
    res.render("index.ejs");
});


app.get("/user", (req, res) => {
  if (!req.session.username) return res.redirect("/");
  res.render("userPage.ejs");
});


app.post("/", (req, res) => {
  const { username, password } = req.body;
  const q = "SELECT * FROM users WHERE username = ? AND password = ?";

  db.query(q, [username, password], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      req.session.username = username;
      res.redirect("/user");  
    } else {
      res.render("index.ejs", { error: true });
    }
  });
});


app.post("/signup", (req, res) => {
  const {username, password} = req.body;
  const  id = uuidv4()
  let q = `insert into users (id, username, password) values ('${id}', '${username}', '${password}')`;
  try{
      db.query(q, (err, result) => {        
        if(err) throw err;
        console.log("sucessful");
    });
  }catch{
    console.log(err);
    res.send("some error in database");
  }
  res.render("signup.ejs");
});

app.post("/user", (req, res) => {
  res.render("userPage.ejs");
});


app.get("/prescription", (req, res) => {
  const username = req.session.username;
  const q = "SELECT * FROM prescriptions WHERE precId = (SELECT id FROM users WHERE username = ?) ";

  db.query(q, [username], (err, results) => {
    if (err) throw err;
    res.render("prescriptions.ejs", { prescriptions: results });
  });
});


app.post("/prescription", (req, res) => {
  const username = req.session.username;

  const q = "SELECT * FROM prescriptions WHERE precId = (SELECT id FROM users WHERE username = ?)";

  db.query(q, [username], (err, results) => {
    if (err) throw err;
    res.render("prescriptions.ejs", { prescriptions: results });
  });
});


app.get("/newPrescription", (req, res) => {
  res.render("newPrescription.ejs");
});


app.post("/newPrescription", (req, res) => {
  const { tabletName, dosage } = req.body;
  const username = req.session.username;

  const getUserIdQuery = "SELECT id FROM users WHERE username = ?";
  db.query(getUserIdQuery, [username], (err, result) => {
    if (err) throw err;

    console.log("Session username:", req.session.username);

    if (result.length === 0) return res.send("User not found");

    const userId = result[0].id;
    const insertQuery = "INSERT INTO prescriptions (precId, tabletName, dosage) VALUES (?, ?, ?)";
    db.query(insertQuery, [userId, tabletName, dosage], (err2) => {
      if (err2) throw err2;
      res.redirect("/prescription");
    });
  });
});

app.get("/diagnosis", (req, res) => {
    res.render("diagnosis.ejs");
});

app.post("/diagnosis", (req, res) => {
    res.render("diagnosis.ejs");
});

app.get("/bloodTest", (req, res) => {
  const username = req.session.username;
  
  const q = "SELECT * FROM bloodTest WHERE bloodId = (SELECT id FROM users WHERE username = ?) ORDER BY dateOfReport DESC";

  db.query(q, [username], (err, results) => {
    if (err) throw err;
    res.render("bloodTest.ejs", { bloodTest: results });
  });
});


app.post("/bloodTest", (req, res) => {
  const username = req.session.username;

  const q = "SELECT * FROM bloodTest WHERE bloodId = (SELECT id FROM users WHERE username = ?) ORDER BY dateOfReport DESC";

  db.query(q, [username], (err, results) => {
    if (err) throw err;
    res.render("bloodTest.ejs", { bloodTest: results });
  });
});

app.get("/newBloodTest", (req, res) => {
  res.render("newBloodTest.ejs");
});

app.post("/newBloodTest", (req, res) => {
  const {bp, hemo, rbcCount, wbcCount, plateletsCount, dateOfReport} = req.body;
  const username = req.session.username;
  const getUserIdQuery = "SELECT id FROM users WHERE username = ?";
  db.query(getUserIdQuery, [username], (err, result) => {
    if (err) throw err;

    console.log("Session username:", req.session.username);

    if (result.length === 0) return res.send("User not found");

    const userId = result[0].id;
    const insertQuery = "INSERT INTO bloodTest (bloodId, bp, hemo, rbcCount, wbcCount, plateletsCount, dateOfReport) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(insertQuery, [userId, bp, hemo, rbcCount, wbcCount, plateletsCount, dateOfReport], (err2) => {
      if (err2) throw err2;
      res.redirect("/bloodTest");
    });
  });
});

app.get("/diabetesTest", (req, res) => {
  const username = req.session.username;
  const q = "SELECT * FROM diabetesTest WHERE diabId = (SELECT id FROM users WHERE username = ?) ORDER BY dateOfReport DESC";

  db.query(q, [username], (err, results) => {
    if (err) throw err;
    res.render("diabetesTest.ejs", { Diabetes: results });
  });
});

app.post("/diabetesTest", (req, res) => {
  const username = req.session.username;
  const q = "SELECT * FROM diabetesTest WHERE diabId = (SELECT id FROM users WHERE username = ?) ORDER BY dateOfReport DESC";
  db.query(q, [username], (err, results) => {
    if (err) throw err;
    res.render("diabetesTest.ejs", { Diabetes : results });
  });
});

app.get("/newDiabetesTest", (req, res) => {
  res.render("newDiabetesTest.ejs");
});

app.post("/newDiabetesTest", (req, res) => {
  const {fastingSugar, postSugar, oralGlucose, urineGlucose, dateOfReport} = req.body;
  const username = req.session.username;
  const getUserIdQuery = "SELECT id FROM users WHERE username = ?";
  db.query(getUserIdQuery, [username], (err, result) => {
    if (err) throw err;

    console.log("Session username:", req.session.username);

    if (result.length === 0) return res.send("User not found");

    const userId = result[0].id;
    const insertQuery = "INSERT INTO diabetesTest (diabId, fastingSugar, postSugar, oralGlucose, urineGlucose, dateOfReport) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(insertQuery, [userId, fastingSugar, postSugar, oralGlucose, urineGlucose, dateOfReport], (err2) => {
      if (err2) throw err2;
      res.redirect("/diabetesTest");
    });
  });
});

app.listen(port, () => {
    console.log("listening");
});
