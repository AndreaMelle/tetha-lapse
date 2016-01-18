var rest = require('restler');
var tetha = new (require('./tetha-api.js'))();
var later = require('later');
var fs = require('fs');
var path = require('path');


var tetha_session_id = null;
var tetha_latest_fingerprint = null;
var tetha_latest_fileuri = null;

tetha.get_info().then(function(data) {
  console.log(data);
}).catch(function(err) {
  console.log(err.name + ': ' + err.message);
});

// tetha.take_picture().then(function(data) {
//   console.log(data);
// }).catch(function(err) {
//   console.log(err.name + ': ' + err.message);
// });

// tetha.get_info(function(data, error) {
//   if(error) {
//
//   }
//   else {
//
//   }
// });

// tetha.get_state(function(data, error) {
//   if(error) {
//     console.log(error.name + ': ' + error.message);
//   }
//   else {
//     console.log(data);
//   }
// });

// tetha.start_session(function(data, error) {
//   if(error) {
//     console.log(error.name + ': ' + error.message);
//   }
//   else {
//     console.log(data);
//     //TODO: check data.state to make sure the operation has terminated
//     tetha.close_session(data.results.sessionId, function(data, error) {
//       if(error) {
//         console.log(error.name + ': ' + error.message);
//       } else {
//         console.log("Session terminated.");
//       }
//     })
//   }
// });

// var tetha_handle_fatal_error = function(msg) {
//     console.log('A fatal error has occured:\n' + msg + '\nThe application will terminate now.\n');
//     process.exit(); //TODO: what code?
// }

// /*
//  * 1. Get info from theta
//  */
// // var tetha_get_info = function() {
// //
// //     rest.get(tetha_get_info_url, {
// //       timeout : 5000
// //     }).on('complete', function(result) {
// //         if(result instanceof Error) {
// //             var msg = result.message + '\n' + 'Cannot connect to Tetha camera.'
// //             tetha_handle_fatal_error(msg);
// //         } else {
// //             console.log('Tetha info:\n');
// //             console.log(result);
// //             tetha_start_session();
// //         }
// //     }).on('timeout', function(ms) {
// //       var msg = 'Cannot connect to Tetha camera.\nConnection timed out.';
// //       tetha_handle_fatal_error(msg);
// //     });
// //
// // };
//
// /*
//  * 2. Start tetha session
//  */
// var tetha_start_session = function() {
//
//   rest.postJson(tetha_execute_command_url, {
//         'name' : 'camera.startSession',
//         'parameters' : { }
//     }).on('complete', function(data, response) {
//       if(data instanceof Error) {
//           var msg = data.message + '\n' + 'Cannot start Tetha session.';
//           tetha_handle_fatal_error(msg);
//       } else {
//
//         if(response.statusCode != 200)
//         {
//             console.log(data);
//             var msg = response.statusCode + '\n' + 'Cannot start Tetha session.';
//             tetha_handle_fatal_error(msg);
//         }
//         else {
//             if(data.state == 'done') {
//               //TODO: check if id is null?
//               tetha_session_id = data.results.sessionId;
//               console.log('Started session with id: ' + tetha_session_id);
//
//               tetha_check_state(tetha_session_id);
//             }
//             else {
//               var msg = data.message + '\n' + 'Cannot start Tetha session.';
//               tetha_handle_fatal_error(msg);
//             }
//         }
//       }
//   });
//
// };
//
// /*
//  * 3. Check tetha state
//  */
//  var tetha_check_state = function() {
//
//    rest.postJson(tetha_check_state_url, {
//
//      }).on('complete', function(data, response) {
//        if(data instanceof Error) {
//            var msg = data.message + '\n' + 'Cannot retrieve Tetha state.';
//            console.log(msg);
//            //TODO: we should attempt again after a delay
//            tetha_end_session(tetha_session_id);
//        } else {
//
//          if(response.statusCode != 200)
//          {
//              console.log(data);
//              var msg = response.statusCode + '\n' + 'Cannot start Tetha session.';
//              console.log(msg);
//              //TODO: we should attempt again after a delay
//              tetha_end_session(tetha_session_id);
//          }
//          else {
//              if(data) {
//                tetha_session_id = data.state.sessionId;
//                tetha_latest_fingerprint = data.fingerprint;
//
//                console.log('Tetha ' + tetha_session_id + ' state:\n');
//                console.log(data);
//                if(tetha_latest_fileuri == null) {
//                  tetha_latest_fileuri = data.state._latestFileUri;
//                }
//
//                if(tetha_latest_fileuri != data.state._latestFileUri)
//                {
//                   tetha_latest_fileuri = data.state._latestFileUri;
//                   tetha_download_latest();
//                }
//                else
//                {
//                   tetha_get_options(tetha_session_id);
//                }
//              }
//              else {
//                var msg = data.message + '\n' + 'Cannot start Tetha session.';
//                console.log(msg);
//                //TODO: we should attempt again after a delay
//
//                tetha_end_session(tetha_session_id);
//              }
//          }
//        }
//    });
//
//  };
//
//  /*
//   * 4. Find out which options are available
//   */
//   var tetha_get_options = function(sid) {
//
//     rest.postJson(tetha_execute_command_url, {
//           'name' : 'camera.getOptions',
//           'parameters' : {
//             'sessionId' : sid,
//             'optionNames' : [
//               'fileFormat',
//               'fileFormatSupport'
//             ]
//           }
//       }).on('complete', function(data, response) {
//         if(data instanceof Error) {
//             var msg = data.message + '\n' + 'Cannot retrieve Tetha options.';
//             tetha_handle_fatal_error(msg);
//         } else {
//
//           if(response.statusCode != 200)
//           {
//               console.log(data);
//               var msg = response.statusCode + '\n' + 'Cannot retrieve Tetha options.';
//               tetha_handle_fatal_error(msg);
//           }
//           else {
//               if(data.state == 'done') {
//
//                 console.log(data.results.options.fileFormat);
//                 console.log(data.results.options.fileFormatSupport);
//
//                 tetha_shoot_still(tetha_session_id);
//               }
//               else {
//                 var msg = data.message + '\n' + 'Cannot retrieve Tetha options.';
//                 tetha_handle_fatal_error(msg);
//               }
//           }
//         }
//     });
//
// };
//
// /*
//  * 5. TODO: Set the image options to best quality available
//  */
//
// /*
// * 6. Snap a picture
// */
// var tetha_shoot_still = function(sid) {
//
//   rest.postJson(tetha_execute_command_url, {
//         'name' : 'camera.takePicture',
//         'parameters' : {
//           'sessionId' : sid
//         }
//     }).on('complete', function(data, response) {
//       if(data instanceof Error) {
//           var msg = data.message + '\n' + 'Cannot shoot still.';
//           //TODO: retry after delay
//       } else {
//
//         if(response.statusCode != 200)
//         {
//             console.log(data);
//             var msg = response.statusCode + '\n' + 'Cannot shoot still.';
//             //TODO: retry after delay
//         }
//         else {
//             //TODO: according to doc, 'done' is never returned here
//             if(data.state == 'done' || data.state == 'inProgress') {
//
//               console.log(data);
//
//               tetha_check_updates();
//             }
//             else {
//               var msg = data.message + '\n' + 'Cannot shoot still.';
//               //TODO: retry after delay
//             }
//         }
//       }
//   });
//
// };
//
// /*
// * 7. Check for update
// */
// var tetha_check_updates = function() {
//
//   rest.postJson(tetha_check_updates_url, {
//         'stateFingerprint' : tetha_latest_fingerprint
//     }).on('complete', function(data, response) {
//       if(data instanceof Error) {
//           var msg = data.message + '\n' + 'Cannot check for updates.';
//           //TODO: retry until success or timeout
//           //TODO: if the check for updates is successful, but it's not the filesave state...
//       } else {
//
//         if(response.statusCode != 200)
//         {
//             console.log(data);
//             var msg = data.message + '\n' + 'Cannot check for updates.';
//             //TODO: retry until success or timeout
//             //TODO: if the check for updates is successful, but it's not the filesave state...
//         }
//         else {
//             console.log(data);
//
//             if(tetha_latest_fingerprint != data.stateFingerprint)
//             {
//                 tetha_latest_fingerprint = data.stateFingerprint;
//                 //TODO: after checking state, look for filesave and retrieve file
//                 tetha_check_state();
//             }
//             else {
//                 setTimeout(tetha_check_updates, 2000);
//             }
//         }
//       }
//   });
//
// };
//
// /*
// * 9. Download latest image
// */
// var tetha_download_latest = function() {
//
//   rest.postJson(tetha_execute_command_url, {
//         'name' : 'camera.getImage',
//         'parameters' : {
//           'fileUri' : tetha_latest_fileuri
//         }
//     }).on('complete', function(data, response) {
//       if(data instanceof Error) {
//           var msg = data.message + '\n' + 'Cannot retrieve latest image.';
//           // TODO: nothing, will try again
//       } else {
//
//         if(response.statusCode != 200)
//         {
//             console.log(data);
//             var msg = data.message + '\n' + 'Cannot retrieve latest image.';
//             // TODO: nothing, will try again
//         }
//         else {
//
//             //TODO: data is image (binary data)
//
//             fs.writeFile(path.basename(tetha_latest_fileuri), response.raw, function(err) {
//
//
//
//                 if(err) {
//                     console.log('Failed to save file: ' + err);
//                 }
//                 else {
//                     console.log('File saved: ' + tetha_latest_fileuri);
//                 }
//
//                 //TODO: schedule another acquisition
//                 //TODO: where do we go? do we need to start session / check state all over again??
//                 tetha_delete_latest();
//             });
//
//
//         }
//       }
//   });
//
// };
//
// /*
// * 9. Download latest image
// */
// var tetha_delete_latest = function() {
//
//   rest.postJson(tetha_execute_command_url, {
//         'name' : 'camera.delete',
//         'parameters' : {
//           'fileUri' : tetha_latest_fileuri
//         }
//     }).on('complete', function(data, response) {
//       if(data instanceof Error) {
//           var msg = data.message + '\n' + 'Cannot delete latest image.';
//           // TODO: nothing, will try again
//       } else {
//
//         if(response.statusCode != 200)
//         {
//             console.log(data);
//             var msg = data.message + '\n' + 'Cannot delete latest image.';
//             // TODO: nothing, will try again
//         }
//         else {
//           console.log(data);
//             tetha_end_session(tetha_session_id);
//         }
//       }
//   });
//
// };
//
//  // once the camera is ready, we need to follow a wait -> capture -> check state until ready -> download image sequence
//  // the problem is, how do we check that the session is
//
//
//
// /*
//  * last. End theta session
//  */
// var tetha_end_session = function(sid) {
//
//   if(sid === 'undefined' || sid == null)
//   {
//      console.log('Tetha session not found.')
//   }
//
//   rest.postJson(tetha_execute_command_url, {
//         'name' : 'camera.closeSession',
//         'parameters' : {
//           'sessionId' : sid
//         }
//     }).on('complete', function(data, response) {
//
//       if(data instanceof Error) {
//           var msg = data.message + '\n' + 'Fail to end Tetha session.';
//           console.log(msg);
//       } else {
//         //TODO: check response, the status code
//         console.log('Status code: ' + response.statusCode);
//         console.log(data);
//
//         if(data.state == 'done') {
//           console.log('Ended session with id: ' + tetha_session_id);
//         }
//         else {
//           var msg = data.message + '\n' + 'Fail to end Tetha session.';
//           console.log(msg);
//         }
//       }
//   });
//
// };


//tetha_get_info();


// var schedule = later.parse.text('every 2 seconds');
// later.date.UTC();
// later.date.localTime();

// var job = function() {

  // console.log(new Date());

  // rest.get('http://google.com').on('complete', function(result) {
  //
  //     if(result instanceof Error) {
  //         console.log('Error: ' + result.message);
  //         //this.retry(5000);
  //     }
  //     else {
  //         console.log(result);
  //     }
  //
  // });

//};

//var timer = later.setTimeout(job, schedule);
//var timer2 = later.setInterval(job, schedule);

//timer2.clear();
