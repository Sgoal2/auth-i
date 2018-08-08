const express = require('express');
const db = require("./data/db.js");
const bcrypt = require("bcryptjs");
const session = require('express-session')

const server = express();
server.use(express.json());

function protected(req, res, next) {
    if (req.session && req.session.username) {
      next();
    } else {
      res.status(401).json({ message: 'you shall not pass!!' });
    }
  }

server.use(
    session({
      name: 'notsession', // default is connect.sid
      secret: 'nobody tosses a dwarf!',
      cookie: { maxAge: 1 * 24 * 60 * 60 * 1000, 
        secure: false,}, // 1 day in milliseconds
      httpOnly: true, // don't let JS code access cookies. Browser extensions run JS code on your browser!
        
      resave: false,
      saveUninitialized: true,
    })
  );

server.get('/', (req, res) => {
    res.send('authing... 63')
})

server.get('/api/users', protected, (req, res) => {//get all projects
    db('users').then(project => {
        res.status(200).json(project)
    }).catch(err => res.status(500).json(err))
});

server.post('/api/register', (req, res) => {
    const user = req.body;
    const hash = bcrypt.hashSync(user.password, 10);
    user.password = hash;

    db('users')
    .insert(user)
    .then( ids => {
        db('users')
        .where({ id: ids[0]})
        .first()
        .then(user => {
            res.status(201).json(user);
        })

    })
    .catch(err => {
        res.status(500).json({error: "error"
    })
        
    })
});

server.post('/login',  (req, res) => {
    const credentials = req.body;

    db('users')
    .where({username: credentials.username})
    .first()
    .then(user => {
        if( user && bcrypt.compareSync(credentials.password, user.password)) {
            req.session.username = user.username;
            res.send('Logged in')

        } else{
            res.status(401).json({error: 'you shall not pass'})
        }
    })
    .catch(err => {
        res.status(500).json(err);
    });
    
});
server.post('/api/login', protected, function(req, res) {
    const credentials = req.body;

    db('users')
        .where({username: credentials.username })
        .first()
        .then(function(user) {
            if (user && bcrypt.compareSync(credentials.password, user.password)) {
                req.session.username = user.username;
                res.send(`Hello ${user.username}`);
            } else{ 
                return res.status(401).json({ error: 'Incorrect credentials' });
            }
        })
        .catch(function(error) {
            res.status(500).json({ error });
        })
})

const port = 6300;
server.listen(port, function () {
    console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`);
});