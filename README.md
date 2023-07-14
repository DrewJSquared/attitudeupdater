# attitudeupdater

## Initial download:
`cd ~/Documents && curl -L -O https://github.com/drewjsquared/attitudeupdater/archive/master.zip && unzip master.zip && mv attitudeupdater-main attitude && rm -r master.zip`

## Install NVM
`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash `
Once this script finishes, open a new terminal window so NVM will take effect. 

## Install NodeJS, NPM, & PM2
`nvm install 16 && npm install pm2 -g`

## Download Latest Source Code
`cd ~/Documents/attitude && curl -L -O https://github.com/drewjsquared/attitudecontrol/archive/master.zip && unzip master.zip && mv attitudecontrol-main AttitudeControl && rm -r master.zip`

## Setup PM2 Processes
`cd ~/Documents/attitude/AttitudeControl && pm2 start AttitudeControl.js && cd ~/Documents/attitude && pm2 start autoupdate.js && pm2 save`