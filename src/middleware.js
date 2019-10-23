const express = require("express");
const path = require("path");

module.exports = function(app) {
  app.use(express.static(path.join(process.cwd(), "./public")));
};
