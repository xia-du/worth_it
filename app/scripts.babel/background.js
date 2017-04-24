'use strict';

chrome
  .runtime
  .onInstalled
  .addListener(function(details) {
    chrome
      .storage
      .sync
      .set({
        currencies: [{
          name: 'Coffee',
          price: 2
        }, {
          name: 'Bentley',
          price: 180000
        }]
      }, function() {});
  });

function runContentScript() {
  chrome
    .tabs
    .query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      // chrome
      //   .tabs
      //   .executeScript(tabs[0], {file: 'content_script.js'});
    });
}

// runContentScript when new currency is added
chrome
  .storage
  .onChanged
  .addListener(function(changes, namespace) {
    runContentScript();
  });

// Change status
// chrome
//   .runtime
//   .onMessage
//   .addListener(function(request, sender, sendResponse) {
//
//     if (request.status == 'on') {
//       chrome
//         .browserAction
//         .setBadgeText({text: 'on'});
//       sendResponse({status: 'on'});
//     } else {
//       chrome
//         .browserAction
//         .setBadgeText({text: ''});
//       sendResponse({status: 'off'});
//     }
//   });

// chrome
//   .tabs
//   .onUpdated
//   .addListener(function(tabId, changeInfo, tab) {
//     chrome
//       .tabs
//       .executeScript(tabs[0].id, {
//         file: 'bower_components/jquery/dist/jquery.min.js'
//       }, function() {
//         // This executes only after jQuery has been injected and executed
//         chrome
//           .tabs
//           .executeScript(tabs[0].id, {file: 'scripts/contentscript.js'});
//       });
//   });
//
// chrome
//   .tabs
//   .onActivated
//   .addListener(function() {
//     chrome
//       .tabs
//       .query({
//         active: true,
//         currentWindow: true
//       }, function(tabs) {
//         chrome
//           .tabs
//           .executeScript(tabs[0].id, {
//             file: 'bower_components/jquery/dist/jquery.min.js'
//           }, function() {
//             // This executes only after jQuery has been injected and executed
//             chrome
//               .tabs
//               .executeScript(tabs[0].id, {file: 'scripts/contentscript.js'});
//           });
//       });
//   })

// chrome
//   .tabs
//   .onUpdated
//   .addListener(function() {
//     chrome
//       .tabs
//       .query({
//         active: true,
//         currentWindow: true
//       }, function(tabs) {
//         chrome
//           .tabs
//           .executeScript(tabs[0].id, {
//             file: 'bower_components/jquery/dist/jquery.min.js'
//           }, function() {
//             // This executes only after jQuery has been injected and executed
//             chrome
//               .tabs
//               .executeScript(tabs[0].id, {file: 'scripts/contentscript.js'});
//           });
//       });
//   })
