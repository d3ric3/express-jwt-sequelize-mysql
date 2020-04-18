const { Sequelize, sequelize } = require("./connection");

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

module.exports = { User };
