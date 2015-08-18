// This file is auto generated based on user-defined interface.
// Please make sure that you have checked all TODOs in this file.
// TODO: please replace types with peramters' name you wanted of any functions
// TODO: please replace $ipcType with one of dbus, binder, websocket and socket

var initObj = {
  "address": "nodejs.webde.sysproperty",
  "path": "/nodejs/webde/sysproperty",
  "name": "nodejs.webde.sysproperty",
  "type": "dbus",
  "service": true,
  "interface": [
    {
      "name": "set",
      "in": [
        "Object"
      ],
      "show": "l"
    },
    {
      "name": "get",
      "in": [
        "String"
      ],
      "show": "l"
    }
  ],
  "serviceObj": {
    set: function(obj, callback) {
      sysproperty.set(obj.key, obj.value, function(err, ret) {
        if (err) {
          return callback({
            err: err
          });
        }
        callback({});
      });
    },
    get: function(key, callback) {
      sysproperty.get(key, function(err, value) {
        if (err) {
          return callback({
            err: err
          });
        }
        callback({
          ret: value
        });
      });
    }
  }
}

function Stub() {
  this._ipc = require('webde-rpc').getIPC(initObj);
}

Stub.prototype.notify = function(event) {
  this._ipc.notify.apply(this._ipc, arguments);
};

var stub = null;
  sysproperty = null;
exports.getStub = function(sysproperty_) {
  if(stub == null) {
    stub = new Stub();
    sysproperty = sysproperty_;
  }
  return stub;
}
