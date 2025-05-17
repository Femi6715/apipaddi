// "use strict";
// const nodemailer = require("nodemailer");

// // async..await is not allowed in global scope, must use a wrapper
// async function main() {

//     // Generate test SMTP service account from ethereal.email
//     // Only needed if you don't have a real mail account for testing
//     let testAccount = await nodemailer.createTestAccount();

//     // create reusable transporter object using the default SMTP transport
//     let transporter = nodemailer.createTransport({
//         host: "simplelotto.ng",
//         port: 465,
//         secure: true, // true for 465, false for other ports
//         auth: {
//             user: 'admins@simplelotto.ng', // generated ethereal user
//             pass: 'T@~U&DoF(&bP' // generated ethereal password
//         },
//         tls: {
//             rejectUnauthorized: false
//         }
//     });

//     // send mail with defined transport object
//     let info = await transporter.sendMail({
//         from: '"Simplelotto" simplelottto@gmail.com', // sender address
//         to: "olanrewajuahmed095@yahoo.com, hollaraywaju@gmail.com", // list of receivers
//         subject: "Hello ✔", // Subject line
//         text: "Hello world?", // plain text body
//         html: "<b>Hello world?</b>" // html body
//     });

//     console.log("Message sent: %s", info.messageId);
//     // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

//     // Preview only available when sending through an Ethereal account
//     console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
// }

// main().catch(console.error);


// testConnection.js
const { mongoose } = require('./config/database'); // Adjust path if needed

mongoose.connection.on('connected', () => {
  console.log('Successfully connected to the database!');
  process.exit(0);
});

mongoose.connection.on('error', (err) => {
  console.error('Database connection error:', err);
  process.exit(1);
});
