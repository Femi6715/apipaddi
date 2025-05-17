const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mysql = require('mysql2');
const config = require('./config/database');
const cron = require('node-cron');
const moment = require('moment');
const helmet = require('helmet');

require('dotenv').config();
require('./config/passport');

// Create MySQL connection pool
const pool = mysql.createPool({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
    port: config.database.port,
    waitForConnections: true,
    connectionLimit: config.database.pool.max,
    queueLimit: 0
});

// Test database connection
pool.getConnection((err, connection) => {
    if (err) {
        console.log('Database Error:', err);
        return;
    }
    console.log('Connected to MySQL database');
    connection.release();
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
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Database Error:', err);
      return;
    }
    const shuffleAlert = todaysDate;
    const ticket_status = 'pending';
    const stake_amt = our_stake_amt;
    connection.query(
      'SELECT * FROM games WHERE draw_date = ? AND ticket_status = ? AND stake_amt = ?',
      [shuffleAlert, ticket_status, stake_amt],
      (err, results) => {
        if (err) {
          console.log('Database Error:', err);
          connection.release();
          return;
        }
        if (results.length > 0) {
          const obj = Object.keys(results);
          const item = obj[Math.floor(Math.random() * obj.length)];
          connection.query(
            'UPDATE games SET ticket_status = ? WHERE _id = ?',
            ['won', results[item]._id],
            (err, result) => {
              if (err) {
                console.log('Database Error:', err);
                connection.release();
                return;
              }
              connection.query(
                'SELECT main_balance FROM users WHERE _id = ?',
                [results[item].user_id],
                (err, winner_info) => {
                  if (err) {
                    console.log('Database Error:', err);
                    connection.release();
                    return;
                  }
                  const winnerBalance = winner_info[0].main_balance;
                  const winnerId = results[item].user_id;
                  let amount_won = parseInt(
                    results[item].potential_winning,
                    10
                  );
                  let new_balance = winnerBalance + amount_won;
                  connection.query(
                    'UPDATE users SET main_balance = ? WHERE _id = ?',
                    [new_balance, winnerId],
                    (err, result) => {
                      if (err) {
                        console.log('Database Error:', err);
                        connection.release();
                        return;
                      }
                      console.log('Winner updated successfully');
                      connection.release();
                    }
                  );
                }
              );
            }
          );
        } else {
          console.log('No games found');
          connection.release();
        }
      }
    );
  });
};

let num_of_winners = (num, stake_amt) => {
    for (i = 0; i < num; i++) {
        if (shuffleDates !== undefined) {
            for (let eachShuffleDate of shuffleDates) {
                if (todaysDate === eachShuffleDate) {
                    cron.schedule(`${5 + i} 10 18 * * *`, () => {
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
        pool.query(
          'UPDATE games SET ticket_status = ? WHERE ticket_status = ? AND draw_date = ?',
          ['lost', 'pending', todaysDate],
          (err, result) => {
            if (err) {
              console.log('Error updating games:', err);
              return;
            }
            console.log('Games updated successfully');
          }
        );
      });
    }
  }
}

app.listen(port, () => {
  console.log('Server running on port ' + port);
});
