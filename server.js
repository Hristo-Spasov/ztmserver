const express = require('express')
const bcrypt = require('bcryptjs')
const cors = require('cors')
const knex = require('knex');



const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    port : 5432,
    user : 'postgres',
    password : 'Lorencia!2',
    database : 'FinalProject'
  }
});



const app = express();



//! Express parser
app.use(express.urlencoded({extended:false})) 
app.use(express.json())

//! cors package to enable CORS :D

app.use(cors())



//* Server req and res

app.get('/',(req,res) => {
    res.send('success')
})

//! LOGIN //
app.post('/signin',(req,res) => {
    db.select('email','hash').from('login')
    .where('email','=',req.body.email)
    .then(data => {
        bcrypt.compare(req.body.pwd, data[0].hash, function(err, isValid) {
            if (isValid) {
                return db.select('*').from('users').where('email', '=', req.body.email)
                .then(user => {
                    res.json(user[0].user)
                })
                .catch(err => res.status(400).json('Something went wrong'))
            } else {
                res.status(400).json('wrong credentials')
            }
        })
    })
    .catch(err => res.status(400).json('wrong credentials'))
})

//! REGISTER //
app.post('/register',(req,res) => {
    const { name, email, pwd } = req.body;
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(pwd, salt, function(err, hash) {
            db.transaction(trx => {
                trx.insert({
                    hash: hash,
                    email: email,
                })
                .into('login')
                .returning('email')
                .then(loginEmail => {
                    return trx('users')
                        .returning('*')
                        .insert({
                            name: name,
                            email: loginEmail[0].email,
                            joined: new Date()
                        })
                        .then(user => {
                            res.json(user[0]);
                        })

                })
                .then(trx.commit)
                .catch(trx.rollback)
            })
            .catch(err => res.status(400).json('Unable to register')) 
        })    
    })
   
}) //! bcrypt is the  HASH FUNCTION IMPLEMENTATION



//! PROFILE ID //
app.get('/profile/:id',(req,res) => {
    const { id } = req.params;
    db.select('*').from('users')
    .where({
        id: id
    })
    .then(user => {
        if (user.length) {
            res.json(user[0])
        } else {
            res.status(400).json('Not found')
        }
        
    })
    .catch(err =>  res.status(400).json('error getting user'))
      
})


//! SCORE UPDATE//

app.put('/imagescore',(req,res) => {
    const { id } = req.body;
    db('users')
    .where('id', '=', id)
    .increment('score',1)
    .returning('score')
    .then(score => {
        res.json(score[0].score);
    })
    .catch(err => res.status(400))
})






/*

root / >> res= this is working
/signIn >> POST responds with success/fail
/register >> POST res w/ new user
/profile/:id >> GET = user
/imagescore >> PUT = user score

*/
app.listen(3000)