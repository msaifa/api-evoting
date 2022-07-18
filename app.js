'use strict';

import Auth from './config/auth'
import moment from 'moment'
import momenttz from 'moment-timezone'

momenttz.tz.setDefault('Asia/Jakarta');
console.log("Server started at : ", moment().format("YYYY-MM-DD HH:mm:ss"))

var createError   = require('http-errors');
var express       = require('express');
var path          = require('path');
var cookieParser  = require('cookie-parser');
var logger        = require('morgan');
var cors          = require('cors')
const glob        = require("glob");
const files       = glob.sync('./controllers/**/*', { cwd: __dirname });

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('tiny'));
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  allowedHeaders:false
}))

app.use((req, res, next) => {
  // next()
  // pause untuk validation header
  const isValid = Auth.validateRequest(req.headers, req.url)
  if (isValid){
    req.body = {
      ...req.body,
      ...isValid
    }
    next() 
  } else {
    res.send({
      status: 401,
      message: "UnAuthorized"
    })
  }
})


// generating controller
for(let f=0,fl=files.length; f<fl; f++){
  const file = files[f];
  if (file && file.substr(file.length - 3) === ".js"){
    let functionName = 
      file
        .split('/controllers/')
        .pop()
        .slice(0, -3) ; // ambil filenya. dikurangin .js
    functionName = functionName.replace("/","-")
    app.use('/'+functionName, require(file));
  }
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');

});

console.log("Sudah Jalan dengan port :", process.env.PORT )
module.exports = app;
