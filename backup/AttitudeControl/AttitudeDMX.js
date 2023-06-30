// AttitudeDMX.js
// JS Module for connecting to Picos for DMX output
// copyright 2023 Drew Shipps, J Squared Systems


// import log
var log = require('npmlog');





// ==================== VARIABLES ====================

// config options
var DEBUG_FPS = true;
var DEBUG_INPUT = false;
var DEBUG_OUTPUT = false;
var RECONNECT_INTERVAL = 500;
var DMX_INTERVAL_SPEED = 35; // best performance found at 32/laptop 36/raspi

//  status & queues
var initialized = [false, false];
var canSend = [true, true];
var queue = [[], []];
var dmxInterval;
var dmxIntervalActive = false;
var framesPerSecond = 0;

// dmxvals
var dmxVals = [[],[],[],[]];
for (var c = 0; c < 512; c++) {
	dmxVals[0][c] = 0;
	dmxVals[1][c] = 0;
	dmxVals[2][c] = 0;
	dmxVals[3][c] = 0;
}




// ==================== PORT FUNCTIONS ====================

// Set up serial ports
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const port = [
	new SerialPort({ path: '/dev/ttyACM0', baudRate: 115200, autoOpen: false, }),  // laptop /dev/cu.usbmodem1201
	new SerialPort({ path: '/dev/ttyACM1', baudRate: 115200, autoOpen: false, }),  // laptop /dev/cu.usbmodem1301
];

const parser = [
	port[0].pipe(new ReadlineParser({ delimiter: '\n' })),
	port[1].pipe(new ReadlineParser({ delimiter: '\n' })),
];


// Port error callbacks
port[0].on('error', function(err) { 
	log.error('DMX', 'Port 1 ' + err.message);
});

port[1].on('error', function(err) { 
	log.error('DMX', 'Port 2 ' + err.message);
});


// Port close callbacks
port[0].on('close', function() {
	log.notice('DMX', 'AttitudeDMX Port 1 disconnected!');
	reconnect(0);
});

port[1].on('close', function() {
	log.notice('DMX', 'AttitudeDMX Port 2 disconnected!');
	reconnect(1);
});


// Port parser callbacks
parser[0].on('data', function(data) {
	parse(0, data);
});

parser[1].on('data', function(data) {
	parse(1, data);
});





// ==================== ATTITUDEDMX FUNCTIONS ====================

// initialize - open serial ports
function initialize() {
	port[0].open(function (err) {
		if (err) {
			log.error('DMX', 'Port 1 ' + err.message);
			reconnect(0);
		}
	});

	port[1].open(function (err) {
		if (err) {
			log.error('DMX', 'Port 2 ' + err.message);
			reconnect(1);
		}
	});
}


// write - function to actually write data to port
function write(p, output) {
	framesPerSecond++;

	if (DEBUG_OUTPUT) { console.log('output' + p + '  ' + output); }

	if (port[p].isOpen) {
		port[p].write(output + '\n', function(err) {
			if (port[p].isOpen) {
				if (err) return log.error('DMX', 'Error on write: ', err.message);
			}
		});
	}
}


// send - function to send data if possible, otherwise add to buffer
function send(p, output) {
	if (canSend[p] == true && initialized[p] == true) {
		canSend[p] = false;
		write(p, output);
	} else {
		queue[p].push(output);
	}
}


// parse - whenver data is recieved, process it
function parse(p, data) {
	var input = data.toString();

  	if (DEBUG_INPUT) { console.log('input' + p + ' ' + input); }

	if (initialized[p] == true) {
		if (input.includes('k')) {
			if (queue[p].length == 0) {
				canSend[p] = true;
			} else {
				write(p, queue[p].shift());
			}
		}
	} else {
		if (input.includes('initAttitudeDMX')) {
			initialized[p] = true;
			canSend[p] = true;
			queue[p] = [];
			log.notice('DMX', 'AttitudeDMX Port ' + (p+1) + ' initialized!');
		}
	}
}


// reconnect - if port closes, attempt to reconnect
var reconnecting = [];
function reconnect(p) {
	if (!port[p].isOpen) {
		initialized[p] = false;

		reconnecting[p] = setInterval(function () {
			if (port[p].isOpen) {
				log.notice('DMX', 'AttitudeDMX Port ' + (p+1) + ' reconnected :)');
				clearInterval(reconnecting[p]);
			} else {
				port[p].open();
			}
		}, RECONNECT_INTERVAL);
	}
}


// senduniverse - loop through DMX vals for universe and send to port
function sendUniverse(universe) {
	if (universe == 0) {
		var p = 0;
		var u = 1;
	} else if (universe == 1) {
		var p = 0;
		var u = 2;
	} else if (universe == 2) {
		var p = 1;
		var u = 1;
	} else if (universe == 3) {
		var p = 1;
		var u = 2;
	}

	var data = String(u);

	for (var c = 0; c < 512; c++) {
		var hex = dmxVals[universe][c].toString(16);
		if (hex.length < 2) {
			hex = "0" + hex;
		}
		data = data + hex;
	}

	// console.log(data);

	send(p, data);
}


// DEBUG FPS - console log some info about the current FPS and queues
if (DEBUG_FPS) {
	setInterval(() => {
		if (DEBUG_FPS && dmxIntervalActive) {
			log.info('DMX Status', 'FPS: ' + framesPerSecond + '  Q0: ' + queue[0].length + '  Q1: ' + queue[1].length);
		}
		framesPerSecond = 0;
	}, 1000);
}





// ==================== MODULE EXPORT FUNCTIONS ====================

module.exports = {
	initialize: function (debug_fps) {
		DEBUG_FPS = debug_fps;
		initialize();
	},

	startDMX: function () {
		dmxIntervalActive = true;
		dmxinterval = setInterval(() => {
			sendUniverse(0);
			sendUniverse(1);
			sendUniverse(2);
			sendUniverse(3);
		}, DMX_INTERVAL_SPEED);
	},

	stopDMX: function () {
		dmxIntervalActive = false;
		dmxinterval.clearInterval();
	},

	set: function (u, c, v) {
		if (u > 0 && u <= 4) {
			if (c > 0 && c <= 512) {
				if (v >= 0 && v <= 255) {
					dmxVals[u-1][c-1] = v;
				}
			}
		}
	},
};