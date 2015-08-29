'use strict';

var _ = require('lodash');
var User = require('./user.model');
var passport = require('passport');

// Get list of users
exports.index = function(req, res) {
  User.find(function (err, users) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(users);
  });
};

// Get a single user
exports.getUser = function(req, res) {
  User.findOne({username: req.payload.username}, function (err, user) {
    if(err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
    var out = {
      username : user.username,
      location : user.location || 'unknown',
      fullname : user.fullname || 'unknown',
    }
    return res.json(out);
  });
};

// Creates a new user in the DB.
exports.create = function(req, res) {
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message:'Please fill out all fields'})
  }
  var user = new User();
  user.username = req.body.username;
  user.setPassword(req.body.password);
  user.fullname = req.body.fullname;
  user.location = req.body.location;

  user.save(function(err) {
    if(err) { return handleError(res, err); }
    return res.status(201).json({token: user.generateJWT()});
  });
};

// Login a user
exports.login = function(req, res,next) {
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message:'Please fill out all fields'})
  }
  passport.authenticate('local', function(err,user,info){
    if(err){return next(err)}

      if(user){
        return res.json({token:user.generateJWT()});
      } else{
        return res.status(401).json(info);
      }
  })(req,res,next);
};

// Updates an existing user in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  User.findOne({username: req.payload.username}, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
      
      if(req.body.password){
        user.setPassword(req.body.password);
      }
      if(req.body.fullname){
        user.fullname = req.body.fullname;
      }
      if(req.body.location){
        user.location = req.body.location;
      }
      

      user.save(function(err) {
        if(err) { return handleError(res, err); }
        var out = {
          username : user.username,
          location : user.location || 'unknown',
          fullname : user.fullname || 'unknown',
        }
        return res.json(out);
      });
  });
};

// Deletes a user from the DB.
exports.destroy = function(req, res) {
  User.findById(req.params.id, function (err, user) {
    if(err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
    user.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}