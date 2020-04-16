// index.js
const express = require("express");
const app = express();
const Sequelize = require("sequelize");

// parse application/json
app.use(express.json());

//parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

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

// error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(err);
});

// start the app
app.listen(3000, function () {
  console.log(`Express is running on port 3000`);
});
