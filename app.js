const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');
const cron = require('node-cron');
const moment = require('moment');
const helmet = require('helmet');

require('dotenv').config();

require('./config/passport');
// const { ObjectID } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
//connecting to database
mongoose.connect(config.database, { useNewUrlParser: true });
const { ObjectID } = require('mongodb');

//test out connection and log status to console.
mongoose.connection.on('connected', () => {
  console.log('connected to the database ' + config.database);
});

//Check for database connection error
mongoose.connection.on('error', err => {
  console.log('Database Error' + err);
});

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(cors());

const users = require('./routes/users');

const games = require('./routes/games');

const category = require('./routes/games-categories');

const transactions = require('./routes/transactions');

const winners = require('./routes/winning-tickets');

const admin = require('./routes/admins');

const transfer = require('./routes/transfer_recipients');

const tickets = require('./routes/tickets');

const port = process.env.PORT || 8080;

// const port = 3000;

app.use(helmet());

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

// body parse middleware
app.use(bodyParser.json());

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use('/users', users);

app.use('/games', games);

app.use('/categories', category);

app.use('/transactions', transactions);

app.use('/winners', winners);

app.use('/admin', admin);

app.use('/tickets', tickets);

app.use('/transfer', transfer);

app.get('/', (req, res) => {
  res.send('Welcome to PADI LOTTO api');
  console.log('there is a hit');
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const currentDay = new Date(new Date().getTime());
const day = currentDay.getDate();
const month = currentDay.getMonth() + 1;
const year = currentDay.getFullYear();
const todaysDate = `${day}-${month}-${year}`;

let drawTimer = (dayINeed, formatTpye) => {
  const today = moment().isoWeekday();
  if (today <= dayINeed) {
    return moment()
      .isoWeekday(dayINeed)
      .format(formatTpye);
  } else {
    return moment()
      .add(1, 'weeks')
      .isoWeekday(dayINeed)
      .format(formatTpye);
  }
};

const endOfTheMonth = moment()
  .endOf('month')
  .format('YYYY-MM-DD');
const startOfTheMonth = moment()
  .startOf('month')
  .format('YYYY-MM-DD');
const endOfTheMonthReversed = moment()
  .endOf('month')
  .format('D-M-YYYY');
  
let detailsDetector = (id, callback) => {
  const firstDrawDay = drawTimer(parseInt(id, 10), 'D');
  const firstDrawMonth = drawTimer(parseInt(id, 10), 'M');
  const firstDrawYear = drawTimer(parseInt(id, 10), 'Y');
  return callback({
    draw_date: `${firstDrawDay}-${firstDrawMonth}-${firstDrawYear}`
  });
};

let shuffleDates = [];
detailsDetector('5', res => {
  shuffleDates.push(res.draw_date);
});
detailsDetector('3', res => {
  shuffleDates.push(res.draw_date);
});
detailsDetector('6', res => {
  shuffleDates.push(res.draw_date);
});

let shuffleMachine = our_stake_amt => {
  MongoClient.connect(
    config.database,
    { useNewUrlParser: true },
    (err, client) => {
      if (err) {
        return console.log('Unable to connect to mongodb database');
      } else {
        const db = client.db('simplelotto');
        const shuffleAlert = todaysDate;
        const ticket_status = 'pending';
        const stake_amt = our_stake_amt;
        db.collection('games')
          .countDocuments({
            draw_date: shuffleAlert,
            ticket_status: ticket_status,
            stake_amt: stake_amt
          })
          .then(count => {
            this.totalCount = count - 1;
            db.collection('games')
              .find(
                {
                  draw_date: shuffleAlert,
                  ticket_status: 'pending',
                  stake_amt: stake_amt
                },
                { skip: this.totalCount }
              )
              .toArray()
              .then(docs => {
                const obj = Object.keys(docs);
                item = obj[Math.floor(Math.random() * obj.length)];

                db.collection('games')
                  .findOneAndUpdate(
                    {
                      _id: docs[item]._id
                    },
                    {
                      $set: {
                        ticket_status: 'won'
                      }
                    },
                    { new: true }
                  )
                  .then(
                    result => {
                      db.collection('users').findOne(
                        { _id: ObjectID(docs[item].user_id) },
                        function(err, winner_info) {
                          if (err) throw err;
                          const winnerBalance = winner_info.main_balance;
                          const winnerId = winner_info._id;
                          let amount_won = parseInt(
                            docs[item].potential_winning,
                            10
                          );
                          let new_balance = winnerBalance + amount_won;

                          db.collection('users')
                            .findOneAndUpdate(
                              {
                                _id: winnerId
                              },
                              {
                                $set: {
                                  main_balance: new_balance
                                }
                              },
                              { new: true }
                            )
                            .then(
                              result => {},
                              status_err => {
                                console.log(
                                  `TICKET STATUS UPDATE FAILED: ${status_err}`
                                );
                              }
                            );
                        },
                        status_err => {
                          console.log(
                            `TICKET STATUS UPDATE FAILED: ${status_err}`
                          );
                        }
                      );
                    },
                    err => {
                      console.log(`UNABLE TO FETCH GAME ${err}`);
                    }
                  );
              })
              .catch(err =>
                console.log('ERROR: could not fetch at this time' + err)
              );
          })
          .catch(error => console.log('error - maybe there are no games'));
      }
    }
  );
};

let num_of_winners = (num, stake_amt) => {
  for (i = 0; i < num; i++) {
    if (shuffleDates !== undefined) {
      for (let eachShuffleDate of shuffleDates) {
        if (todaysDate === eachShuffleDate) {
          cron.schedule(`${05 + i} 10 18 * * *`, () => {
            shuffleMachine(stake_amt);
          });
        }
      }
    }
  }
};

num_of_winners(0, 25);
num_of_winners(0, 50);
num_of_winners(0, 100);

if (shuffleDates !== undefined) {
  for (let eachShuffleDate of shuffleDates) {
    if (todaysDate === eachShuffleDate) {
      cron.schedule('50 10 18 * * *', function() {
        MongoClient.connect(
          config.database,
          { useNewUrlParser: true },
          (err, client) => {
            if (err) {
              return console.log('Unable to connect to mongodb database');
            } else {
              const db = client.db('simplelotto');
              const shuffleAlert = todaysDate;
              const ticket_status = 'pending';
              const shuffleInfo = {
                draw_date: shuffleAlert,
                ticket_status: ticket_status
              };
              db.collection('games')
                .updateMany(
                  {
                    ticket_status: ticket_status,
                    draw_date: shuffleAlert
                  },
                  {
                    $set: {
                      ticket_status: 'lost'
                    }
                  },
                  { new: true }
                )
                .then(
                  result => {},
                  err => {
                    console.log(`UNABLE TO UPDATE GAME ${err}`);
                  }
                );
            }
          }
        );
      });
    }
  }
}




// // Enable CORS for all routes or specify the allowed origin
// app.use(cors({
//   origin: 'http://localhost:4200'  // Adjust as needed or use '*' for all origins
// }));

// // // Your other middleware and routes
// // app.use('/users', require('./routes/users'));

// // const PORT = process.env.PORT || 3000;


app.listen(port, () => {
  console.log('Server running on port ' + port);
});
