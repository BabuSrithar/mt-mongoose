var cls = require('continuation-local-storage');
var createNamespace = cls.createNamespace;
var mtMongooseSessionSet = createNamespace('mt-mongoose-session');
var defaultDb = null;
var systemDb = null;
var getNamespace = cls.getNamespace;
var MTMongoose = function () {
};
//Default tenant db which is used to perform useDB operation.
MTMongoose.prototype.setDefaultTenantDB = function (_defaultDB) {
    defaultDb = _defaultDB;
};

//Utility Method to set system(non tenant specific DB) Use this method, so that the model usage across tenant specific and non tenant specific will look same.
MTMongoose.prototype.setGlobalDB = function (_systemDb) {
    systemDb = _systemDb;
};
//Method used to set
MTMongoose.prototype.setTenantId = function (req, res, next) {
    mtMongooseSessionSet.run(function () {
        mtMongooseSessionSet.set("tenant_id", req._tid);
        next();
    });
};

MTMongoose.prototype.getTenantId = function () {
    var mtMongooseSessionGet = getNamespace('mt-mongoose-session');
    var tenant_id = mtMongooseSessionGet.get("tenant_id");
    return tenant_id;
};

var getMTModel = function (schemaObj) {
    var tenantDBId = this.getTenantId();
    var tenantDB = defaultDb.useDb(tenantDBId ? tenantDBId : "test");
    if (tenantDB) {
        return tenantDB.model(schemaObj.modelName ? schemaObj.modelName : schemaObj.name, schemaObj.schema)
    }
};
var getSystemModel = function (schemaObj) {
    return systemDb.model(schemaObj.modelName ? schemaObj.modelName : schemaObj.name, schemaObj.schema)
};

MTMongoose.prototype.getModel = function (schemaObj) {
    if(schemaObj.isGlobal){
        return getSystemModel(schemaObj);
    }else{
        return getMTModel(schemaObj)
    }
};

module.exports = new MTMongoose();