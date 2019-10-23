const path = require("path");

module.exports = function(app) {
  const control = require("./controllers.js");

  app.get("/", control.home);
};
