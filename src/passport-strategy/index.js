const passportJWT = require("passport-jwt");

const { User } = require("../db/models");

// Setting up passport-jwt module
// ExtractJwt to help extract the token
let ExtractJwt = passportJWT.ExtractJwt;

// JwtStrategy which is the strategy for the authentication
let JwtStrategy = passportJWT.Strategy;
let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = "wowwow";

// lets create our strategy for web token
let jwtStrategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
  console.log("payload received", jwt_payload);
  let user = User.findOne({ where: { id: jwt_payload.id } })
    .then((user) => {
      if (user) {
        next(null, user);
      } else {
        next(null, false);
      }
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = { jwtStrategy, jwtOptions };
