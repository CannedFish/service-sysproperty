var config = require('systemconfig'),
  utils = require('utils'),
  flowctl = utils.Flowctl(),
  json4line = utils.Json4line(),
  fs = require('fs'),
  util = require('util'),
  event = require('events'),
  localPath = config.SYSTEM_PORPERTY_PATH[0] + '/property.conf',
  globalPath = config.SYSTEM_PORPERTY_PATH[1] + '/property.conf',
  initPera = {};

function SystemProperty(ret_) {
  var ret = ret_ || {
    success: function() {},
    fail: function() {}
  };
  this._gConf = {};
  this._lConf = {};
  event.EventEmitter.call(this);

  this._loadPropertyList(function(err) {
    if (err) {
      return ret.fail(err);
    }
    ret.success();
  });
}

util.inherits(SystemProperty, event.EventEmitter);

// load langList from system
SystemProperty.prototype._loadPropertyList = function(callback_) {
  var cb_ = callback_ || function() {};
  var _this = this;
  // initialize this list from local to global
  flowctl.series([{
    fn: function(pera_, callback_) {
      json4line.readJSONFile(localPath, function(err_, json_) {
        if (err_) {
          return callback_(null);
        } else {
          _this._lConf = json_;
          callback_(null);
        }
      });
    }
  }, {
    fn: function(pera_, callback_) {
      json4line.readJSONFile(globalPath, function(err_, json_) {
        if (err_) {
          return callback_(err_);
        } else {
          _this._gConf = json_;
          callback_(err_);
        }
      });
    }
  }], function(err_, rets_) {
    if (err_) return cb_('Fail to load property list: ' + err_);
    cb_(null);
  });
}

SystemProperty.prototype.notify = function(event_, property_,value_) {
  stub.notify(event_, {
    Data: {
      event: event_,
      property: property_,
      value:value_ 
    }
  });
}

function hasPermission () {
  return true;
}

SystemProperty.prototype.set = function(key, value, callback_) {
  var cb_ = callback_ || function() {};
  //permission  determination
  if (!hasPermission()) return cb_('you have no permission!');

  //the key is in  property.conf or not
  if (this._lConf.hasOwnProperty(key)) {
    //has the property
    for (var item in this._lConf) {
      if (item == key) {
        if (this._lConf[item] == value) return cb_(key + ' is not changed');
        this._lConf[item] = value;

        var _this = this;
        json4line.writeJSONFile(localPath, this._lConf, function(err_) {
          if (err_) return cb_(err_);
          _this.notify('change', key, value);
          cb_(null);
        });
      }
    }
  } else {
    //add a property
    this._lConf[key] = value;
    var _this = this;
    json4line.writeJSONFile(localPath, this._lConf, function(err_) {
      if (err_) return cb_(err_);
      _this.notify('add', key, value);
      cb_(null);
    });
  }
}

SystemProperty.prototype.get = function(key, callback_) {
  var cb_ = callback_ || function() {};
  if (this._lConf.hasOwnProperty(key)) {
    ret = this._lConf[key];
    cb_(null, ret);
  } else if (this._gConf.hasOwnProperty(key)){
    ret = this._gConf[key];
    cb_(null, ret);
  }else{
    err = "can not find this property!";
    cb_(err, null);
  }
}

var stub = null;
(function main() {
  var syspropertyMgr = new SystemProperty({
    success: function() {
      stub = require('../interface/syspropertyStub').getStub(syspropertyMgr);
      console.log('system property manager start OK');
    },
    fail: function(reason) {
      syspropertyMgr = null;
      console.log('system property manager start failed:', reason);
    }
  });
})();