const path = require('path');
const irp = require(path.join(__base, 'lib', 'irp'));
var express = require('express');
var router = express.Router();
var database = require(path.join(__base, 'database', 'database'));
var users = require(path.join(__base, 'lib', 'users'));

const itemsPerPage = 10.0;

router.get('/', function (req, res) {
  database.getUserType(req.session.userID, function (type) {
    if (!users.isAdmin(type)) {
      irp.addError(req, 'You need to be a manager in order to manage users.');
      res.redirect('back');
    } else {
      database.getUserName(req.session.userID, function (name) {
        var vars = irp.getGlobalTemplateVariables(req);
        var keyword = req.query.keyword;
        var offset;
        var page;

        if (req.query.page === undefined) {
          offset = 0;
          page = 1;
        } else {
          page = parseInt(req.query.page);
          if (isNaN(page)) {
            offset = 0;
            page = 1;
          } else if (page < 1) {
            offset = 0;
            page = 1;
          } else offset = (page - 1) * itemsPerPage;
        }

        vars.page = page;
        vars.name = name[0].name;

        if (req.query.keyword === undefined) {
          database.getUsersCount(function (result) {
            var numberOfUsers = result[0].count;
            vars.totalPages = Math.ceil(numberOfUsers / itemsPerPage);
            database.listUsers(offset, itemsPerPage, function (error, result) {
              if (error) {
                console.error(error);
                irp.addError(req, 'Unknown error occurred.');
                res.redirect('/');
                return;
              }

              result.forEach(
                function (user) {
                  user.isAdmin = users.isAdmin(user.type);
                  user.type = users.getTypeDescription(user.type);

                }
              );
              vars.users = result;
              if (req.session.userID !== undefined)
                vars.userID = req.session.userID;
              res.render('manageUsers', vars);
            });
          });
        } else {
          database.searchUsers(keyword, offset, itemsPerPage, function (error, result) {
            var numberOfUsers = result.length;
            vars.keyword = keyword;
            vars.totalPages = Math.ceil(numberOfUsers / itemsPerPage);
            result.forEach(
              function (user) {
                user.isAdmin = users.isAdmin(user.type);
                user.type = users.getTypeDescription(user.type);
              }
            );
            vars.users = result;
            if (req.session.userID !== undefined)
              vars.userID = req.session.userID;
            res.render('manageUsers', vars);
          });
        }
      });
    }
  });
});

router.post('/createAdmin', function (req, res) {
    validateAdmin(req);
    req.Validator.getErrors(function (errors) {
      if (errors.length == 0) {
        database.getUserByEmail(req.body.email, function (err, user) {
          if (err) {
            console.error(err);
            irp.addError(req, err);
            res.redirect('../../');
            irp.cleanActionResults(req);
          } else if (user) {
            irp.addError(req, 'An account already exists with the email address "' +
              user.email + '".');
            res.redirect('../../');
            irp.cleanActionResults(req);
          } else {
            // Creating hash and salt
            passwordHashAndSalt(req.body.password).hash(function (error, passwordHash) {
              if (error) {
                console.error(err);
                irp.addError(req, error);
                res.redirect('../../');
                irp.cleanActionResults(req);
              }

              var emailConfirmationToken = crypto.randomBytes(32).toString('hex');
              database.createAdmin(req.body.name, req.body.email, passwordHash, req.body.type,
                req.body.role, emailConfirmationToken,
                function (err) {
                  if (err) {
                    console.error(err);
                    irp.addError(req, err);
                    res.redirect('../../');
                    irp.cleanActionResults(req);
                  } else {
                    sendActivationEmail(req.body.email, emailConfirmationToken, function (err) {
                      if (err) {
                        console.error(err);
                        irp.addError(req, err);
                      } else {
                        irp.addSuccess(req, 'Account successfully created. Please check your email to validate your account.');
                      }

                      res.redirect('../../');
                      irp.cleanActionResults(req);
                    });
                  }
                });
            });
          }
        });
      } else {
        errors.forEach(function (item, index) {
          irp.addError(req, item);
        });

        res.redirect('../../');
        irp.cleanActionResults(req);
      }
    });

});

var validateAdmin = function (req) {
  // Documentation for the form validator: https://www.npmjs.com/package/form-validate
  req.Validator.validate('name', 'Name', {
    required: true,
    length: {
      min: 3,
      max: 200,
    },
  })
    .filter('name', {
      trim: true,
    })
    .validate('email', 'Email', {
      required: true,
      email: true,
    })
    .filter('email', {
      trim: true,
    })
    .validate('password', 'Password', {
      required: true,
      length: {
        min: 7,
      },
    })
    .filter('password', {
      stripTags: false,
      escapeHTML: false,
    })
    .validate('type', 'Account type', {
      required: true,
      between: {
        min: 1,
        max: 3,
      },
    });
};
module.exports = router;
