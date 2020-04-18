const Sequelize = require("sequelize");

const DB_URI = process.env.DB_URI;

// initialize an instance of Sequelize
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

module.exports = { Sequelize, sequelize };
