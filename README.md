# attitudeupdater
 


## Initial download:
`cd ~/Documents && curl -L -O https://github.com/drewjsquared/attitudeupdater/archive/master.zip && unzip master.zip && mv attitudeupdater-main attitude && rm -r master.zip`

## Install NVM, NodeJS, NPM, & PM2
`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash && nvm install 16 && npm install pm2 -g`

## Setup PM2 Processes
`cd ~/Documents/attitude/AttitudeControl && pm2 start AttitudeControl.js && cd ~/Documents/attitude && pm2 start autoupdate.js && pm2 save`