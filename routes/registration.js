const express = require("express");
const app = express();
const path = require("path");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
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
Users.init(
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        is: /^[a-zA-Z0-9]{1,}$/
      }
    },
    surname: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        is: /^[a-zA-Z0-9]{1,}$/
      }
    },
    login: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        is: /^([a-zA-z])(?!\S*?[\(\)\{\}\/\\\[\],. а-яА-Я]).{5,}$/
      },
      unique: {
        args: true,
        msg: "Login already used!"
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        is: /^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9])(?!\S*?[\(\)\{\}\/\\\[\],. а-яА-Я]).{6,})\S$/
      }
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      },
      unique: {
        args: true,
        msg: "Email address already in use!"
      }
    }
  },
  {
    sequelize,
    modelName: "users"
  }
);

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "./../views/registration.html"));
});

router.post("/", (req, res) => {
  const regReqObj = {
    name: req.body.name,
    surname: req.body.surname,
    login: req.body.login,
    password: req.body.password,
    email: req.body.email
  };
  if (req.body === null) return res.status(400).end();
  Users.findAll({
    where: {
      [Op.or]: [
        {
          login: regReqObj.login
        },
        {
          email: regReqObj.email
        }
      ]
    }
  })
    .then(arr => {
      const errArr = [];
      if (arr.length) {
        arr.map(el => {
          if (el.dataValues.login === regReqObj.login)
            errArr.push({
              path: "login",
              message: "Login already used!"
            });
          if (el.dataValues.email === regReqObj.email)
            errArr.push({
              path: "email",
              message: "Email address already in use!"
            });
        });
      }
      if (regReqObj.password !== req.body.repeatPassword)
        errArr.push({
          path: "repeatPassword",
          message: "Passwords don't match!"
        });
      return errArr;
    })
    .then(arr => {
      if (arr.length) {
        res.status(400).send(JSON.stringify(arr));
      } else {
        Users.create(regReqObj)
          .then(() => {
            res.status(200).send("Registration success");
          })
          .catch(Sequelize.ValidationError, err => {
            res.status(400).send(
              JSON.stringify([
                {
                  path: err.errors[0].path,
                  message: err.errors[0].message
                }
              ])
            );
          });
      }
    });
});

module.exports = router;
