// index.js
const express = require("express");
const app = express();
const Sequelize = require("sequelize");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const passportJWT = require("passport-jwt");

// initialize an instance of Sequelize
const DB_URI = "mysql://users_db_admin:pass123@localhost/users_db?charset=UTF8";
const sequelize = new Sequelize(DB_URI, {
  dialectOptions: {
    charset: "utf8",
    multipleStatements: true,
  },
  logging: false,
});

// check the databse connection
sequelize
  .authenticate()
  .then(() => console.log("Connection has been established successfully."))
  .catch((err) => console.error("Unable to connect to the database:", err));

// create user model
const User = sequelize.define("user", {
  name: {
    type: Sequelize.STRING,
  },
  password: {
    type: Sequelize.STRING,
  },
});

// create table with user model
User.sync()
  .then(() => console.log("Oh yeah! User table created successfully"))
  .catch((err) =>
    console.log("BTW, did you enter wrong database credentials?")
  );

// create some helper functions to work on the database
const createUser = async ({ name, password }) => {
  return await User.create({ name, password });
};
const getAllUsers = async () => {
  return await User.findAll();
};
const getUser = async (obj) => {
  return await User.findOne({
    where: obj,
  });
};

// Setting up passport-jwt module
// ExtractJwt to help extract the token
let ExtractJwt = passportJWT.ExtractJwt;
// JwtStrategy which is the strategy for the authentication
let JwtStrategy = passportJWT.Strategy;
let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = "wowwow";
// lets create our strategy for web token
let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
  console.log("payload received", jwt_payload);
  let user = getUser({ id: jwt_payload.id });
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});
// use the strategy
passport.use(strategy);

// parse application/json
app.use(express.json());

//parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// initialize passport module
app.use(passport.initialize());

// get all users
app.get("/users", function (req, res) {
  getAllUsers().then((user) => res.json(user));
});

// register route
app.post("/register", function (req, res, next) {
  try {
    const { name, password } = req.body;
    createUser({ name, password }).then((user) =>
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
      let user = await getUser({ name });
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
// Send GET request with Header `Authorization: Bearer ${token_value}`
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
