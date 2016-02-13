var Promise = require('promise');
var TethaEndpoint = require('./tetha-api.js');
var fs = require('fs');
var path = require('path');

var tetha = new TethaEndpoint();

// we need variables to keep global state
// things like session id, whether there's a session running...they are unique per camera

// whether there's an active session
var mIsActive = false;

// current session id
var mSessionId = null;

// current timeout
var mTimeout = 0;

// whether it's curently taking a picture
var mBusy = false;
var mPictureAcquisitionAttempts = 0;
var MAX_ATTEMPTS = 10;

function TethaDevice() { }

var _doStartSession = function () {
  return new Promise(function(resolve, reject) {
    mIsActive = false;
    mSessionId = null;

    tetha.start_session().then(function(data) {
      mIsActive = true;
      mSessionId = data.results.sessionId;
      mTimeout = data.results.timeout;
      resolve(data);
    }).catch(function(err) {
      reject(err);
    });
  });
};

var _doRestartSession = function () {
  //FIXME: is there a 'no matter what' feature in promises?
  return new Promise(function(resolve, reject) {
    tetha.close_session().then(function(data) {
      resolve(_doStartSession());
    }).catch(function(err) {
      resolve(_doStartSession());
    });
  });
};

var _doWaitForPictureCompletion = function (cmdid, onsuccess, onerror) {

  tetha.check_cmd_status(cmdid).then(function(data) {

    if(data.state == 'done') {

      mBusy = false;
      onsuccess(data);

    } else if(data.state == 'inProgress') {

      mPictureAcquisitionAttempts--;
      if(mPictureAcquisitionAttempts > 0) {

        setTimeout(function() {
          _doWaitForPictureCompletion(cmdid, onsuccess, onerror)
        }, 1000);

      } else {
        mBusy = false;
        var err = new TethaEndpoint.ThetaTimeout('Wait for new picture timed out.');
        onerror(err);
      }

    } else {
      mBusy = false;
      var err = new TethaEndpoint.ThetaError('Wait for picture error.');
      onerror(err);
    }

  }).catch(function(err) {
    mBusy = false;
    onerror(err);
  });

};

/*
 * Starts a camera session or checks existing session
 * Restarts a 'broken' session (session id mismatch)
 */
TethaDevice.prototype.start = function() {

  return new Promise(function(resolve, reject) {

    if(mIsActive && mSessionId) {
      tetha.get_state().then(function(data) {

        if(data.state.sessionId == mSessionId) {
          resolve({ 'sessionId' : mSessionId, 'timeout' : timeout });
        } else {
          resolve(_doRestartSession());
        }

      }).catch(function(err) {
        resolve(_doRestartSession());
      });
    } else {
        resolve(_doStartSession());
    }

  });
};

/*
 * Stops a camera session if exists
 */
TethaDevice.prototype.stop = function() {

  return new Promise(function(resolve, reject) {
    if(mIsActive && mSessionId) {
      resolve(tetha.close_session(mSessionId));
    } else {
      var err = new TethaEndpoint.ThetaError('No active session.');
      reject(err);
    }
  });
};

/*
 * Takes a picture
 * we can take a picture only if we have a session
 * and if previously taken picture has finished (actually, this is true in HDR mode only)
 * there are two ways we handle overlapping
 * 1. we reject
 * 2. we enqueue request for picture until the previous request is resolved
 * We pick solution 1 for now, and we resolve not when picture is taken, but when picture is saved on file
 */
TethaDevice.prototype.takePicture = function() {

  return new Promise(function(resolve, reject) {

    if(mIsActive && mSessionId)
    {
      if(!mBusy)
      {
        mBusy = true;

        tetha.take_picture(mSessionId).then(function(data) {

          mPictureAcquisitionAttempts = MAX_ATTEMPTS;

          _doWaitForPictureCompletion(data.id, function(data) {
            resolve(data);
          }, function(err) {
            reject(err);
          });

        }).catch(function(err) {
          mBusy = false;
          reject(err);
        });

      } else {
        var err = new TethaEndpoint.ThetaError('Camera busy.');
        reject(err);
      }

    } else {
      var err = new TethaEndpoint.ThetaError('No active session.');
      reject(err);
    }

  });

};

/*
 * Saves a picture in local directory and optionally deletes the file
 */
TethaDevice.prototype.savePicture = function(imguri, outputdir, removeFromDevice, withMetadata) {
  return new Promise(function(resolve, reject) {

    if(!outputdir || !fs.existsSync(outputdir))
    {
      var err = new TethaEndpoint.ThetaError('Invalid output directory.');
      reject(err);
    }

    tetha.get_image(imguri).then(function(data) {

      fs.writeFile(outputdir + path.basename(imguri), data.image, function(err) {
        if(err) {
            reject(err);
        }
        else {
            data['localpath'] = outputdir + path.basename(imguri);

            if(withMetadata) {

            } else {
              
            }

            if(removeFromDevice) {
              tetha.delete_image(imguri).then(resolve(data)).catch(function(err) {
                console.log("Warning: delete image failed.")
                resolve(data);
              })
            }
            else {
              resolve(data);
            }

        }
      });

    }).catch(function(err) {
      reject(err);
    });

  });
};

module.exports = TethaDevice;
