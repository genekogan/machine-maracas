let video;
let poseNet;
let poses = [];

let noseX, noseY;
let eyeLX, eyeLY, eyeRX, eyeRY;



var HOST = location.origin.replace(/^http/, 'ws')
var DEVICE_INTERVAL = 100;
var ws;

function setupWS() {
  ws = new WebSocket(HOST);
  ws.onmessage = function(event) {
    var data = JSON.parse(event.data);
    console.log("got a message");
    console.log(data);
  };
  ws.onclose = function(event) {
    displayData = false;
    alert('Disconnected from server, please refresh and resubmit');
  };  
}


function sendWS() {

  var wsMsg = {
    'id': 'myUserID',
    'imageData' : ctx.elt.toDataURL(),
    'deviceData' : {'x':1.0, 'y':2.0, 'z':3.0}
  };

  ws.send(JSON.stringify(wsMsg));
}

function keyPressed() {
  console.log("keypress");
  if (key==' '){
    console.log("go");
    sendWS();
  }
}

function setupTracking() {
  video = createCapture(VIDEO);
  video.size(width, height);
  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', onPose);
  video.hide();    
  //registerMethod('pre', updateTracking);
}

var ctx;
function setup() {
  ctx = createCanvas(640, 480);
  setupTracking();
  setupWS();
}


function modelReady() {
  select('#status').html('Model Loaded');
}

function onPose(results) {
  poses = results;
}

function cropImage(img, x, y, w, h) {
  var cropped = createImage(w, h);
  cropped.copy(img, x, y, x+w, y+h, 0, 0, x+w, y+h);
  return cropped;
}

function draw() {
  image(video, 0, 0, 10, 10);
  //drawTracking();

  if (poses.length != 1) {
    return;
  }

  let pose = poses[0].pose;
  
  let eyeL = pose.keypoints[1].position;
  let eyeR = pose.keypoints[2].position;
  let eyeM = 0.5 * (eyeL.y + eyeR.y);
  let eye1x = min(eyeL.x, eyeR.x);
  let eye2x = max(eyeL.x, eyeR.x);
  
  let eyeDist = eye2x - eye1x;

//   let x1 = constrain(eye1x-dist, 0, video.width);
//   let x2 = constrain(eye2x+dist, 0, video.width);
//   let y1 = constrain(eyeM - 1.5*dist, 0, video.height);
//   let y2 = constrain(eyeM + 1.5*dist, 0, video.height);
  
  let distMult = 1.5;
  let distMultY = (1.0 + distMult * 2) / 2.0;
  
  let x1 = eye1x - distMult * eyeDist;
  let x2 = eye2x + distMult * eyeDist;
  let y1 = eyeM - distMultY * eyeDist;
  let y2 = eyeM + distMultY * eyeDist;
  
  
  let img2 = cropImage(video, x1, y1, x2-x1, y2-y1);
  img2.resize(300, 300);
  
  image(img2, 50, 50);

  if (frameCount % 200==0) {
    //sendWS();
  }
  
}

