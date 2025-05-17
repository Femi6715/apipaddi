#!/bin/bash

# Database Configuration
heroku config:set DB_HOST=27gi4.h.filess.io
heroku config:set DB_USER=Padilotto_wordrushof
heroku config:set DB_PASSWORD=d030caf65b4e0827f462ebbca5a2aaeff45bf969
heroku config:set DB_NAME=Padilotto_wordrushof
heroku config:set DB_PORT=3307

# JWT Secret
heroku config:set JWT_SECRET=yourSuperSecretKey

# Mail Configuration
heroku config:set MAILGUN_USER=postmaster@simplelotto.ng
heroku config:set MAILGUN_API_KEY=your_mailgun_api_key
heroku config:set MAIL_FROM=welcome@simplelotto.ng

# SMS Configuration
heroku config:set SMS_USERNAME=management@simplelotto.ng
heroku config:set SMS_API_KEY=8521a8fc22fa85a013f63e724086420447b7b907
heroku config:set SMS_SENDER=Simplelotto 