const handleRegister = (req, res , db, bcrypt) => {
    const { name, email, pwd } = req.body;
    if (!name || !email || !pwd) {
        return res.status(400);
    }
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(pwd, salt, function(err, hash) {
            db.transaction(trx => {
                trx.insert({
                    hash: hash,
                    email: email,
                })//! bcrypt is the  HASH FUNCTION IMPLEMENTATION
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
   
} 

module.exports = {
    handleRegister: handleRegister
}