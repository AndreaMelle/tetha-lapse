var rest = require('restler');
var Promise = require('promise');

var tetha_address_base = "http://192.168.1.1/osc/";
//var tetha_port = "80";
var info_endpoint = tetha_address_base + 'info';
var state_endpoint = tetha_address_base + 'state';
var execute_command_endpoint = tetha_address_base + 'commands/execute';
var check_updates_endpoint = tetha_address_base + 'checkForUpdates';
var check_cmd_status_endpoint = tetha_address_base + 'commands/status';

function TethaEndpoint() { }

TethaEndpoint.ThetaError = function(message) {
    this.name = "ThetaError";
    this.message = (message || "");
}

TethaEndpoint.ThetaTimeout = function(message) {
    this.name = "ThetaTimeout";
    this.message = (message || "");
}

TethaEndpoint.ThetaError.prototype = Error.prototype;
TethaEndpoint.ThetaTimeout.prototype = Error.prototype;

//TODO: on request fail, actually check status code 4XX or 5XX

/*
 * GET /osc/info
 * Acquires basic information about the camera and supported function.
 * response: see https://developers.theta360.com/en/docs/v2/api_reference/protocols/info.html
 */
TethaEndpoint.prototype.get_info = function() {

  return new Promise(function(resolve, reject) {
    rest.get(info_endpoint, {
      timeout : 5000
    }).on('success', function(data, response) {
      if(data['model'] != "RICOH THETA S") {
        var err = new TethaEndpoint.ThetaError('Could not find a Tetha S device.');
        eject(err);
      }
      else {
        resolve(data);
      }
    }).on('timeout', function(ms) {
      var err = new TethaEndpoint.ThetaTimeout('Info request timed out');
      reject(err);
    }).on('error', function(err, response) {
      reject(err);
    }).on('fail', function(data, response) {
      var err = new TethaEndpoint.ThetaError('Info request failed - ' + response.statusCode);
      reject(err);
    });
  });

};

/*
 * POST /osc/state
 * Acquires the camera status.
 * Changes in the state object content can be checked with CheckForUpdates.
 * response: see https://developers.theta360.com/en/docs/v2/api_reference/protocols/state.html
 */
TethaEndpoint.prototype.get_state = function() {

  return new Promise(function(resolve, reject) {
    rest.postJson(state_endpoint, { }, {
      timeout : 5000
    }).on('timeout', function(ms) {
      var err = new TethaEndpoint.ThetaTimeout('State request timed out');
      reject(err);
    }).on('error', function(err, response) {
      reject(err);
    }).on('fail', function(data, response) {
      var err = new TethaEndpoint.ThetaError('State request failed - ' + response.statusCode);
      reject(err);
    }).on('success', function(data, response) {
      resolve(data);
    });
  });

};

/*
 * Starts the session. Issues the session ID.
 * response: see https://developers.theta360.com/en/docs/v2/api_reference/commands/camera.start_session.html
 */
TethaEndpoint.prototype.start_session = function() {

  return new Promise(function(resolve, reject) {
    rest.postJson(execute_command_endpoint, {
        'name' : 'camera.startSession',
        'parameters' : { }
    }, {
      timeout : 5000
    }).on('timeout', function(ms) {
      var err = new TethaEndpoint.ThetaTimeout('Session start request timed out');
      reject(err);
    }).on('error', function(err, response) {
      reject(err);
    }).on('fail', function(data, response) {
      var err = new TethaEndpoint.ThetaError('Session start request failed - ' + response.statusCode);
      reject(err);
    }).on('success', function(data, response) {
      resolve(data);
    });
  });

};

/*
 * Updates the session. Extends the validity period of the session.
 * sid: id of session we want to update
 * response: see https://developers.theta360.com/en/docs/v2/api_reference/commands/camera.update_session.html
 */
TethaEndpoint.prototype.update_session = function(sid) {

  return new Promise(function(resolve, reject) {

    if(!sid)
    {
      var err = new TethaEndpoint.ThetaError('Invalid session id.');
      reject(null);
    }

    rest.postJson(execute_command_endpoint, {
      'name' : 'camera.updateSession',
      'parameters' : { 'sessionId' : sid }
    }, {
      timeout : 5000
    }).on('timeout', function(ms) {
      var err = new TethaEndpoint.ThetaTimeout('Session update request timed out');
      reject(null);
    }).on('error', function(err, response) {
      reject(null);
    }).on('fail', function(data, response) {
      var err = new TethaEndpoint.ThetaError('Session update request failed - ' + response.statusCode);
      reject(null);
    }).on('success', function(data, response) {
      resolve("");
    });
  });

};

/*
 * Closes the session.
 * sid: id of session we want to close
 */
TethaEndpoint.prototype.close_session = function(sid) {

  return new Promise(function(resolve, reject) {

    // Evaluates to false is sid is null or typeof 'undefined'
    if(!sid)
    {
      var err = new TethaEndpoint.ThetaError('Invalid session id.');
      reject(err);
    }

    rest.postJson(execute_command_endpoint, {
      'name' : 'camera.closeSession',
      'parameters' : { 'sessionId' : sid }
    }, {
      timeout : 5000
    }).on('timeout', function(ms) {
      var err = new TethaEndpoint.ThetaTimeout('Session close request timed out');
      reject(err);
    }).on('error', function(err, response) {
      reject(err);
    }).on('fail', function(data, response) {
      var err = new TethaEndpoint.ThetaError('Session close request failed - ' + response.statusCode);
      reject(err);
    }).on('success', function(data, response) {
      resolve("");
    });
  });

};

/*
 * POST /osc/checkForUpdates
 * Acquires the current status ID, and checks for changes to the State status.
 * fingerprint: fingerprint of latest state
 * response: see https://developers.theta360.com/en/docs/v2/api_reference/protocols/check_for_updates.html
 */
TethaEndpoint.prototype.check_updates = function(fingerprint) {

  return new Promise(function(resolve, reject) {

    if(!fingerprint)
    {
      var err = new TethaEndpoint.ThetaError('Invalid fingerprint.');
      reject(err);
    }

    rest.postJson(check_updates_endpoint, {
      'stateFingerprint' : fingerprint
    }, {
      timeout : 5000
    }).on('timeout', function(ms) {
      var err = new TethaEndpoint.ThetaTimeout('Check updates request timed out');
      reject(err);
    }).on('error', function(err, response) {
      reject(err);
    }).on('fail', function(data, response) {
      var err = new TethaEndpoint.ThetaError('Check updates request failed - ' + response.statusCode);
      reject(err);
    }).on('success', function(data, response) {
      resolve(data);
    });
  });

};

/*
 * POST /osc/commands/status
 * Acquires the execution status of the command.
 * cmdid: Command ID acquired by Commands/Execute
 * response: see https://developers.theta360.com/en/docs/v2/api_reference/protocols/commands_status.html
 */
TethaEndpoint.prototype.check_cmd_status = function(cmdid) {

  return new Promise(function(resolve, reject) {
    if(!cmdid)
    {
      var err = new TethaEndpoint.ThetaError('Invalid command name.');
      reject(err);
    }

    rest.postJson(check_cmd_status_endpoint, { 'id' : cmdid }, {
      timeout : 5000
    }).on('timeout', function(ms) {
      var err = new TethaEndpoint.ThetaTimeout('Check command status request timed out');
      reject(err);
    }).on('error', function(err, response) {
      reject(err);
    }).on('fail', function(data, response) {
      var err = new TethaEndpoint.ThetaError('Check command status request failed - ' + response.statusCode);
      reject(err);
    }).on('success', function(data, response) {
      resolve(data);
    });
  });

};

/*
 * Starts still image shooting.
 * Note that if command executed successful, return data will always have state 'inProgress'
 * Use the other methods (check_updates, check_cmd_status) to check for status update and then retrieve the file
 * sid: current camera session id
 * response: see https://developers.theta360.com/en/docs/v2/api_reference/commands/camera.take_picture.html
 */
TethaEndpoint.prototype.take_picture = function(sid) {

  return new Promise(function(resolve, reject) {

    if(!sid)
    {
      var err = new TethaEndpoint.ThetaError('Invalid session id.');
      reject(err);
    }

    rest.postJson(execute_command_endpoint, {
        'name' : 'camera.takePicture',
        'parameters' : { 'sessionId' : sid }
    }, {
      timeout : 5000
    }).on('timeout', function(ms) {
      var err = new TethaEndpoint.ThetaTimeout('Take picture request timed out');
      reject(err);
    }).on('error', function(err, response) {
      reject(err);
    }).on('fail', function(data, response) {
      var err = new TethaEndpoint.ThetaError('Take picture request failed - ' + response.statusCode);
      reject(err);
    }).on('success', function(data, response) {
      resolve(data);
    });

  });
};

/*
 * Acquires images.
 * imguri: uri of image as returned by get_state or check_cmd_status requests
 * Response: binary data for image (JPEG)
 */
TethaEndpoint.prototype.get_image = function(imguri) {

  return new Promise(function(resolve, reject) {

    if(!imguri)
    {
      var err = new TethaEndpoint.ThetaError('Invalid image uri.');
      reject(err);
    }

    rest.postJson(execute_command_endpoint, {
        'name' : 'camera.getImage',
        'parameters' : { 'fileUri' : imguri }
    }, {
      timeout : 5000
    }).on('timeout', function(ms) {
      var err = new TethaEndpoint.ThetaTimeout('Get image request timed out');
      reject(err);
    }).on('error', function(err, response) {
      reject(err);
    }).on('fail', function(data, response) {
      var err = new TethaEndpoint.ThetaError('Get image request failed - ' + response.statusCode);
      reject(err);
    }).on('success', function(data, response) {
      resolve({
        'data' : data,
        'response' : response,
        'image' : response.raw
      });
    });

  });
};

/*
 * Get the metadata of a previously acquired image.
 * imguri: uri of image as returned by get_state or check_cmd_status requests
 * response: see https://developers.theta360.com/en/docs/v2/api_reference/commands/camera.get_metadata.html
 */
TethaEndpoint.prototype.get_metadata = function(imguri) {

  return new Promise(function(resolve, reject) {

    if(!imguri)
    {
      var err = new TethaEndpoint.ThetaError('Invalid image uri.');
      reject(err);
    }

    rest.postJson(execute_command_endpoint, {
        'name' : 'camera.getMetadata',
        'parameters' : { 'fileUri' : imguri }
    }, {
      timeout : 5000
    }).on('timeout', function(ms) {
      var err = new TethaEndpoint.ThetaTimeout('Get image request timed out');
      reject(err);
    }).on('error', function(err, response) {
      reject(err);
    }).on('fail', function(data, response) {
      var err = new TethaEndpoint.ThetaError('Get image request failed - ' + response.statusCode);
      reject(err);
    }).on('success', function(data, response) {
      resolve(data);
    });

  });
};

/*
 * Delete an image if exists.
 * imguri: uri of image as returned by get_state or check_cmd_status requests
 */
TethaEndpoint.prototype.delete_image = function(imguri, callback) {

  return new Promise(function(resolve, reject) {

    if(!imguri)
    {
      var err = new TethaEndpoint.ThetaError('Invalid image uri.');
      reject(err);
    }

    rest.postJson(execute_command_endpoint, {
        'name' : 'camera.delete',
        'parameters' : { 'fileUri' : imguri }
    }, {
      timeout : 5000
    }).on('timeout', function(ms) {
      var err = new TethaEndpoint.ThetaTimeout('Delete image request timed out');
      reject(err);
    }).on('error', function(err, response) {
      reject(err);
    }).on('fail', function(data, response) {
      var err = new TethaEndpoint.ThetaError('Delete image request failed - ' + response.statusCode);
      reject(err);
    }).on('success', function(data, response) {
      resolve(data);
    });
  });

};

/*
 * Acquires the properties and property support specifications for shooting, the camera, etc.
 * Additional documentation: https://developers.theta360.com/en/docs/v2/api_reference/commands/camera.get_options.html
 * sid: session id of current camera session
 * optionNames: JSON format option name list to be acquired
 */
TethaEndpoint.prototype.get_options = function(sid, optionNames) {

  return new Promise(function(resolve, reject) {

    if(!sid)
    {
      var err = new TethaEndpoint.ThetaError('Invalid image session id.');
      reject(err);
    }

    if(!optionNames || optionNames.constructor !== Array)
    {
      var err = new TethaEndpoint.ThetaError('Invalid option names array.');
      reject(err);
    }

    rest.postJson(execute_command_endpoint, {
        'name' : 'camera.getOptions',
        'parameters' : { 'sessionId' : sid, 'optionNames' : optionNames }
    }, {
      timeout : 5000
    }).on('timeout', function(ms) {
      var err = new TethaEndpoint.ThetaTimeout('Get options request timed out');
      reject(err);
    }).on('error', function(err, response) {
      reject(err);
    }).on('fail', function(data, response) {
      var err = new TethaEndpoint.ThetaError('Get options request failed - ' + response.statusCode);
      reject(err);
    }).on('success', function(data, response) {
      resolve(data);
    });
  });

};

/*
 * Property settings for shooting, the camera, etc.
 * Additional documentation: https://developers.theta360.com/en/docs/v2/api_reference/commands/camera.set_options.html
 * sid: session id of current camera session
 * options: Set of option names and setting values to be set in JSON format
 */
TethaEndpoint.prototype.set_options = function(sid, options) {

  return new Promise(function(resolve, reject) {

    if(!sid)
    {
      var err = new TethaEndpoint.ThetaError('Invalid image session id.');
      reject(err);
    }

    if(!options)
    {
      var err = new TethaEndpoint.ThetaError('Invalid options.');
      reject(err);
    }

    rest.postJson(execute_command_endpoint, {
        'name' : 'camera.setOptions',
        'parameters' : { 'sessionId' : sid, 'options' : options }
    }, {
      timeout : 5000
    }).on('timeout', function(ms) {
      var err = new TethaEndpoint.ThetaTimeout('Set options request timed out');
      reject(err);
    }).on('error', function(err, response) {
      reject(err);
    }).on('fail', function(data, response) {
      var err = new TethaEndpoint.ThetaError('Set options request failed - ' + response.statusCode);
      reject(err);
    }).on('success', function(data, response) {
      resolve(data);
    });
  });

};




module.exports = TethaEndpoint;
