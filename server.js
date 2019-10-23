require("dotenv").config();
const express = require("express");
const app = express();

app.listen(process.env.PORT, function() {
  require("./src")(app);
  console.log("active: http://localhost:" + process.env.PORT);
});
