// index.js
require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");

// db models
const { User } = require("./src/db/models");
// JWT passport strategy
const { jwtStrategy, jwtOptions } = require("./src/passport-strategy");

const app = express();

// use the strategy
passport.use(jwtStrategy);

// parse application/json
app.use(express.json());

//parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// initialize passport module
app.use(passport.initialize());

// get all users
app.get("/users", function (req, res) {
  User.findAll().then((user) => res.json(user));
});

// register route
app.post("/register", function (req, res, next) {
  try {
    const { name, password } = req.body;
    User.create({ name, password }).then((user) =>
      res.json({ user, msg: "account created successfully" })
    );
  } catch (err) {
    next(err);
  }
});

// login route
app.post("/login", async function (req, res, next) {
  try {
    const { name, password } = req.body;
    if (name && password) {
      // we get the user with the name and save the resolved promise returned;
      let user = await User.findOne({ where: { name } });
      if (!user) {
        res.status(401).json({ msg: "No such user found", user });
      }
      if (user.password === password) {
        // from now on we’ll identify the user by the id and the id is
        // the only personalized value that goes into our token
        let payload = { id: user.id };
        let token = jwt.sign(payload, jwtOptions.secretOrKey);
        res.json({ msg: "ok", token: token });
      } else {
        res.status(401).json({ msg: "Password is incorrect" });
      }
    }
  } catch (err) {
    next(err);
  }
});

// protected route
// Send GET request with Header`Authorization: Bearer ${token_value}`
app.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    res.json({
      msg: "Congrats! You are seeing this because you are authorized",
    });
  }
);

// error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(err);
});

// start the app
app.listen(3000, function () {
  console.log(`Express is running on port 3000`);
});
