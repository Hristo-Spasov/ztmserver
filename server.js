const express = require('express')
const bcrypt = require('bcryptjs')
const cors = require('cors')
const knex = require('knex');
const register = require('./controllers/register')
const login = require('./controllers/login')
const profileId = require('./controllers/profileId')
const image = require('./controllers/images')



const db = knex({
  client: 'pg',
  connection: {
    host : process.env.DB_HOST,
    port : process.env.DB_PORT,
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME
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
app.post('/signin',(req,res) => { login.handleLogin(req, res , db, bcrypt) })
//! REGISTER //
app.post('/register',(req,res) => { 
    register.handleRegister(req, res , db, bcrypt)
})
//! PROFILE ID //
app.get('/profile/:id',(req,res) => {profileId.handleProfileId(req,res,db)})
//! Image URL
app.post('/imageUrl',(req,res) => {image.handleApiCall(req,res)})

//! SCORE UPDATE//
app.put('/imagescore',(req,res)=> {image.handleImageScore(req,res,db)})


app.listen(3000)



/*

root / >> res= this is working
/signIn >> POST responds with success/fail
/register >> POST res w/ new user
/profile/:id >> GET = user
/imagescore >> PUT = user score

*/
