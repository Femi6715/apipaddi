require('dotenv').config();

// module.exports = {
//     database: {
//         host: 'localhost',
//         user: 'root',
//         password: '62221085',
//         database: 'simplelotto',
//         pool: {
//             max: 5,
//             min: 0,
//             acquire: 30000,
//             idle: 10000
//         }
//     },
//     secret: 'yourSuperSecretKey'
// }

module.exports = {
    database: {
        url: process.env.DB_URL || 'mysql://Padilotto_wordrushof:d030caf65b4e0827f462ebbca5a2aaeff45bf969@27gi4.h.filess.io:3307/Padilotto_wordrushof',
        host: process.env.DB_HOST || '27gi4.h.filess.io',
        user: process.env.DB_USER || 'Padilotto_wordrushof',
        password: process.env.DB_PASSWORD || 'd030caf65b4e0827f462ebbca5a2aaeff45bf969',
        database: process.env.DB_NAME || 'Padilotto_wordrushof',
        port: process.env.DB_PORT || 3307,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    },
    secret: process.env.JWT_SECRET || 'yourSuperSecretKey'
}
