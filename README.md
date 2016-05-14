# mt-mongoose
This is a library module which adds multi tenancy capability to mongoose. By default mongoose models are attached to a single mongo db, in scenarios where each tenant(customer) 
has its own mongo db defined, the logic to switch between mongo dbs gets in middle of business logic. This library helps in abstracting away the multi tenant db switching logic 
from actual business logic code. This can be used with standalone nodejs scripts or frameworks like expressjs.

## how it works?
1. It proposes a slight tweak in declaring the mongoose model, such that it gets created every time its called.
2. This library uses continuation-local-storage module to set the tenant db name in the beginning of the code execution.
3. When the model is getting created it attaches the model to the tenenat specific DB it gets from current session of continuation-local-storage.

## Defining mt-mongoose model 
Here is an example of how to create a mt-mongoose model
```javascript
var mongoose = require('mongoose');
var mt_mongoose = require("mt-mongoose");
User = {
    schema: new mongoose.Schema({
            userid: String,
            firstName: String,
            lastName: String
        }
    ),
    name: "users",
    isGlobal: false //attribute to tell if the model is in global DB across tenants or a tenant specific DB 
};
module.exports = function () {
    return mt_mongoose.getModel(User);
};
```

## Using mt-mongoose model 
The mt-mongoose model can be used exactly the same way as mongoose model itself. 
The only deference is an extra function call brackets '()' when initializing.
example:
```javascript
router.get('/index', function (req, res, next) {
    User().find(function (err, users) {
        if (err)
            res.send(err);
        res.json(users);
    });
});
```

## Usage in Express APP(using a middleware)
Create a middleware like this and add it to your app, after mongoose.createConnection is called
```javascript
   var express = require('express');
    var path = require('path');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var methodOverride = require('method-override');
    var restify = require('express-restify-mt-mongoose');
    
    //App initialization and setting default handlers
    var app = express();
    app.use(bodyParser.json());
    app.use(methodOverride());
    
    //Initialization of tenant specific default db and global db
    var mongoose = require('mongoose');
    var tenantDBUri = 'mongodb://localhost/test1'; //this should come from config
    defaultTenantDb = mongoose.createConnection(tenantDBUri);
    var globalDBUri = 'mongodb://localhost/global'; //this should come from config
    globalDb = mongoose.createConnection(globalDBUri);
    var mt_mongoose = require("mt-mongoose");
    mt_mongoose.setDefaultTenantDB(defaultTenantDb); //Set default tenant specific DB
    mt_mongoose.setGlobalDB(globalDb); //Set global db across tenants
    
    // Multi tenant middleware
    app.use(function (req, res, next) {
        req._tid = req.query.tid;//example of fetching tenant id from a query parameter, this can be from user object , session etc.
        mt_mongoose.setTenantId(req, res, next);
    });
    
    
    //App's routes
    app.get('/index', function (req, res, next) {
        User().find(function (err, users) {
            if (err)
                res.send(err);
            res.json(users);
        });
    });
    
    
    var router = express.Router();
    var User = require('./models/User');
    //var util = require("./util/util");
    restify.serve(router, User()); //example of using express-restify-mt-mongoose
    app.use('/', router);
    
    module.exports = app;
    app.listen(3001);
```












