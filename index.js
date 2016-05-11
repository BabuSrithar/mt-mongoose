var createNamespace = require('continuation-local-storage').createNamespace;
var mtMongooseSessionSet = createNamespace('mt-mongoose-session');
var defaultDb = null;
var systemDb = null;
var getNamespace = require('continuation-local-storage').getNamespace;
var MTMongoose = function () {
};
//Default tenant db which is used to perform useDB operation.
MTMongoose.prototype.setMTDefaultDB = function (_defaultDB) {
    defaultDb = _defaultDB;
};

//Utility Method to set system(non tenant specific DB) Use this method, so that the model usage across tenant specific and non tenant specific will look same.
MTMongoose.prototype.setSystemDB = function (_systemDb) {
    systemDb = _systemDb;
};
//Method used to set
MTMongoose.prototype.setTenantId = function (tenantId) {
    mtMongooseSessionSet.run(function () {
        mtMongooseSessionSet.set("tenant_id", tenantId);
        next();
    });
};

MTMongoose.prototype.getTenantId = function () {
    var mtMongooseSessionGet = getNamespace('mt-mongoose-session');
    var tenant_id = mtMongooseSessionGet.get("tenant_id");
    return tenant_id;
};

MTMongoose.prototype.getMTModel = function (schemaObj) {
    var tenantDBId = this.getTenantId();
    var tenantDB = defaultDb.useDb(tenantDBId ? tenantDBId : "test");
    if (tenantDB) {
        return tenantDB.model(schemaObj.modelName ? schemaObj.modelName : schemaObj.name, schemaObj.schema)
    }
};
MTMongoose.prototype.getSystemModel = function (schemaObj) {
    return systemDb.model(schemaObj.modelName ? schemaObj.modelName : schemaObj.name, schemaObj.schema)
};
module.exports = new MTMongoose();