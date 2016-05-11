var mongoose = require('mongoose');
var createNamespace = require('continuation-local-storage').createNamespace;
var mtMongooseSession = createNamespace('mt-mongoose-session');


module.exports = function MTMongoose() {

    var uri = 'mongodb://localhost/test1';
    this.tdb = mongoose.createConnection(uri);
    return function MTMongoose(req, res, next) {
        var tenantId = req.query.tid;
        mtMongooseSession.set("tdb", this.tdb.useDb(tenantId));
        next();
    }
}
