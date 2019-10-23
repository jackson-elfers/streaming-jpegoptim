// index: main

module.exports = function(app) {
  // middleware
  require("./middleware.js")(app);

  // routes
  require("./routes")(app);
};
