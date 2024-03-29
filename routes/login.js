const express = require("express");
const path = require("path");
const Sequelize = require("sequelize");
const router = express.Router();

const sequelize = new Sequelize("JquNDev7GA", "JquNDev7GA", "vYpSRLmr34", {
  host: "remotemysql.com",
  dialect: "mysql",
  define: {
    timestamps: false,
    freezeTableName: true
  }
});

const Model = Sequelize.Model;
class Users extends Model {}
Users.init({
  login: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      is: /^([a-zA-z])(?!\S*?[\(\)\{\}\/\\\[\],. а-яА-Я]).{5,}$/
    }
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      is: /^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9])(?!\S*?[\(\)\{\}\/\\\[\],. а-яА-Я]).{6,})\S$/
    }
  }
}, {
  sequelize,
  modelName: "users"
});

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "./../views/login.html"));
});

router.post("/", (req, res) => {
  if (req.body === null) return res.status(400).end();
  Users.findAll({
    where: {
      login: req.body.login,
      password: req.body.password
    }
  }).then(user => {
    if (user.length) {
      req.session.userId = user[0].id;
      res.send("Success");
    } else {
      res.status(422).send("Wrong login or password");
    }
  });
});

module.exports = router;