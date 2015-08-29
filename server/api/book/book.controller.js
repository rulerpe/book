'use strict';

var _ = require('lodash');
var Book = require('./book.model');
var User = require('../user/user.model');

// Get list of books
exports.index = function(req, res) {
  User.findOne({username: req.payload.username}, function(err, user){
    if(err) { return handleError(res, err); }
    Book.find({'_id': { $not: { $in: user.books}}}, function(err, books){
      if(err) {return handleError(res,err);}
      return res.status(200).json(books);
    })
  })
};

// Get a single book
exports.show = function(req, res) {
  Book.findById(req.params.bookid, function (err, book) {
    if(err) { return handleError(res, err); }
    if(!book) { return res.status(404).send('Not Found'); }
    User.findById(book.owner, function(err,user){
      if(err) { return handleError(res, err); }
      if(user.username !== req.payload.username){
        return res.status(404).send('you cant access');
      }
      return res.json(book);
    })

  });

};

//get my books
exports.showMyBooks = function(req, res) {
  User.findOne({username: req.payload.username}, function(err, user){
    if(err) { return handleError(res, err); }
    Book.find({'_id': { $in: user.books}}, function(err, books){
      if(err) {return handleError(res,err);}
      return res.status(200).json(books);
    })
  })
  
};

// Creates a new book in the DB.
exports.create = function(req, res) {
  var book = new Book();
  book.name = req.body.name;
  book.img = req.body.img;
  User.findOne({username: req.payload.username}, function (err, user) {
    if(err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
    book.owner = user;
    book.status = "open";
    user.books.push(book);
    user.save(function(err){
        if(err) { return handleError(res, err); }
        book.save(function(err){
          if(err) { return handleError(res, err); }
            return res.json(book);
        });
    });
  });
};

// Updates an existing book in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Book.findById(req.params.id, function (err, book) {
    if (err) { return handleError(res, err); }
    if(!book) { return res.status(404).send('Not Found'); }
    var updated = _.merge(book, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(book);
    });
  });
};

// trade books
exports.trade = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Book.findById(req.params.id, function (err, book) {
    if (err) { return handleError(res, err); }
    if(!book) { return res.status(404).send('Not Found'); }
    if(req.body.status){
      book.status = req.body.status;
      book.save(function(err){
        return res.status(200).json(book);
      })
    }else{
      User.findOne({username: req.payload.username}, function(err,user){
        user.tradeBooks.push(book);
        user.save(function(err){
          if (err) { return handleError(res, err); }
          book.trader = user;
          book.status = "pending";
          book.save(function(err){
            return res.status(200).json(book);
          })
        })
      })
    }
  });
};

// Deletes a book from the DB.
exports.destroy = function(req, res) {
  Book.findById(req.params.id, function (err, book) {
    if(err) { return handleError(res, err); }
    if(!book) { return res.status(404).send('Not Found'); }
    User.findById(book.owner, function(err, user){
      var i = user.books.indexOf(book._id);
      user.books.splice(i,1);
      user.save(function(err){
        if(err) { return handleError(res, err); }
        User.findById(book.trader, function(err, trader){
          if(trader){
            var i = trader.tradeBooks.indexOf(book._id);
                    trader.tradeBooks.splice(i,1);
              trader.save(function(err){
                if(err) { return handleError(res, err); }
                book.remove(function(err) {
                  if(err) { return handleError(res, err); }
                  return res.status(204).json({message:'deleted'});
                });
              })
            }else {
              book.remove(function(err) {
                  if(err) { return handleError(res, err); }
                  return res.status(204).json({message:'deleted'});
                });
            }
          
          
        })
      })
      
      
    })
    
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}