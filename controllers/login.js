const handleLogin = (req,res,db,bcrypt) => {
    const {email, pwd } = req.body;
    if (!email || !pwd) {
        return res.status(400);
    }
    db.select('email','hash').from('login')
    .where('email','=',email)
    .then(data => {
        bcrypt.compare(pwd, data[0].hash, function(err, isValid) {
            if (isValid) {
                return db.select('*').from('users').where('email', '=', email)
                .then(user => {
                    res.json(user[0])
                    
                })
                .catch(err => res.status(400).json('Something went wrong'))
            } else {
                res.status(400).json('wrong credentials')
            }
        })
    })
    .catch(err => res.status(400).json('wrong credentials'))
}

module.exports = {
    handleLogin: handleLogin
}