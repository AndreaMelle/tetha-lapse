var rest = require('restler');
var tetha = new (require('./tetha-device.js'))();

var tetha_session_id = null;
var tetha_latest_fingerprint = null;
var tetha_latest_fileuri = null;

var pic_start;
var pic_end;
var frequency = (Math.max(15.0, parseFloat(process.argv[3])) || 15.0) * 1000.0; //in ms
var pictures_count = parseInt(process.argv[2]) || 5;
var connected = false;
var should_schedule = false;
var elapsed;

tetha.start().then(function(data) {

  console.log(data);
  connected = true;
  should_schedule = true;
  elapsed = frequency;

  check_schedule();

}).catch(function(err) {
  console.log(err.name + ': ' + err.message);
  connected = false;
});

function take_picture() {

  pic_start = new Date().getTime();

  tetha.takePicture().then(function(data) {

    console.log(data);
    return tetha.savePicture(data.results.fileUri, 'pictures/', true);

  }).then(function(data) {

    pic_end = new Date().getTime();
    elapsed = pic_end - pic_start;
    pictures_count--;
    should_schedule = true;
    console.log(elapsed / 1000.0 + " seconds");

    check_schedule();

  }).catch(function(data) {

    console.log(err.name + ': ' + err.message);
    elapsed = frequency;
    should_schedule = true;

    check_schedule();

  });

}

function check_schedule() {

  if(pictures_count <= 0)
  {
    should_schedule = false;

    tetha.stop().then(function(data) {
      connected = false;
      console.log("Camera session end.");
    });

    return;
  }

  if(connected && should_schedule) {
    should_schedule = false;
    var t = frequency - elapsed;

    if(t > 0) {
      console.log("will take in " + t / 1000.0 + " seconds");
      setTimeout(take_picture, t);
    } else {
      console.log("will take now");
      take_picture();
    }

  }


}
