// autoupdate.js
// automatic updater script for Attitude Control software
// copyright 2023 Drew Shipps, J Squared Systems


// cron schedule
var cron = require('node-cron');

cron.schedule('0 * * * *', () => {
	// import log
	var log = require('npmlog');

	log.info('AUTOUPDATE', 'Automatic Update Script for Attitude Control Device Firmware');
	log.info('AUTOUPDATE', 'Copyright 2023 Drew Shipps, J Squared Systems');


	var fs = require('fs')


	// remove old backup
	fs.exists('backup/AttitudeControl', function(exists) {
		if (exists) {
			log.info('AUTOUPDATE', 'Backup code found, deleting now...');
			fs.rmSync('backup/AttitudeControl', { recursive: true, force: true });
			log.info('AUTOUPDATE', 'Deleted backup code.');
		} else {
			log.info('AUTOUPDATE', 'No backup code found.');
		}
	});


	// move current to backup
	setTimeout(function () {
		fs.exists('AttitudeControl', function(exists) {
			if (exists) {
				log.info('AUTOUPDATE', 'Old code found, moving to backup folder...');
				fs.rename('AttitudeControl', 'backup/AttitudeControl', function (err) {
					if (err) {
						log.error('AUTOUPDATE', err.message);
					} else {
						log.info('AUTOUPDATE', 'Moved old code to backup folder.');
					}
				});
			} else {
				log.info('AUTOUPDATE', 'No old code found.');
			}
		});
	}, 1000);


	// download repo
	const download = require('download-git-repo');

	setTimeout(function () {
		log.info('AUTOUPDATE', 'Downloading new code...');
		download('drewjsquared/attitudecontrol', './AttitudeControl', function (err) {
			if (err) {
				log.error('AUTOUPDATE', err.message);
			} else {
				log.info('AUTOUPDATE', 'Download code success!');

				setTimeout(function () {
					log.info('AUTOUPDATE', 'Rebooting device now...');

					// retuire('child_process').exec('sudo /sbin/shutdown -r 1', function (msg) { console.log(msg) });
				}, 2000);
			}
		})
	}, 2000);
});