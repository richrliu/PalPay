var express = require('express');
var router = express.Router();
var models = require('../models/index');
var md5 = require('blueimp-md5');

//Redirect to index or home, depending on loggedinuser
function redirectLogin(req, res) {
  if (!verifyLogin(req, res)) {
    res.render('index');
    return;
  }
}

//Return false if not logged in, otherwise redirect
function verifyLogin(req, res) {
  if (req.session.loggedinuser) {
    res.render('home', { user: JSON.stringify(req.session.loggedinuser) });
    return true;
  } else {
    return false;
  }
}

router.get('/', function(req, res, next) {
  redirectLogin(req, res);
});

router.post('/login', function(req, res, next) {
  var username = req.body.Username;
  var hashedPW = md5(req.body.Password);
  models.Users.findOne({where: {Username: username, Password: hashedPW}}).then(function(user) {
    if (user === null) {
      res.render('index', { error: 'User/Password not found.' });
    } else {
      req.session.loggedinuser = user.dataValues; //this is what logs users in
      redirectLogin(req, res);
    }
  });
});

router.all('/logout', function(req, res, next) {
  req.session = null;
  res.render('index', { error: 'Logged out.' });
});

router.post('/register', function(req, res, next) {
  var username = req.body.UsernameRegistration;
  var hashedPW = md5(req.body.PasswordRegistration);
  var hashedPWConfirm = md5(req.body.ConfirmPasswordRegistration);
  if (hashedPW == hashedPWConfirm) {
    models.Users.create({Username: username, Password: hashedPW}).then(function(user) {
      req.session.loggedinuser = user.dataValues; //this is what logs users in
      redirectLogin(req, res);
    });
  } else {
    res.render('index', { error: 'Passwords didn\'t match.' });
  }
});

//-- USER ENDPOINTS
router.post('/users', function(req, res) {
  verifyLogin(req, res);
  var hashedPW = md5(req.query.Password);
  models.Users.create({
    Username: req.query.Username,
    Password: hashedPW,
    Ranking: req.query.Ranking
  }).then(function(user) {
    models.Profile.create({
      UserUsername: req.query.Username
    });
    res.json(user);
  });
});

router.get('/users', function(req, res) {
  verifyLogin(req, res);
  models.Users.findAll({}).then(function(users) {
    res.json(users);
  });
});

//-- PROFILE ENDPOINTS
router.put('/profile/:username', function(req, res) {
  verifyLogin(req, res);
  models.Profile.find({
    where: {
      UserUsername: req.params.username
    }
  }).then(function(profile) {
    if(profile){
      profile.updateAttributes({
        PictureURL: req.query.PictureURL,
        Description: req.query.Description
      }).then(function(new_profile) {
        res.send(new_profile);
      });
    }
  });
});

//-- LOAN ENDPOINTS
router.post('/loan', function(req, res) {
  verifyLogin(req, res);
  models.Loan.create({
    Amount: req.query.amount,
    ExpectedEndDate: req.query.expectedEndDate,
    InterestRate: req.query.interestRate,
    AmountRemaining: req.query.amountRemaining,
    Lender: req.query.lender,
    Receiver: req.query.receiver
  }).then(function(loan) {
    res.json(loan);
  });
});


//-- MESSAGE ENDPOITNS
router.post('/message', function(req, res) {
  verifyLogin(req, res);
  models.Message.create({
    Text: req.query.text,
    TimeSent: new Date(),
    SenderName: req.query.senderName, //TODO: Update sender using cookies n shit
    ReceiverName: req.query.receiverName
  }).then(function(loan) {
    res.json(loan);
  });
});

module.exports = router;
