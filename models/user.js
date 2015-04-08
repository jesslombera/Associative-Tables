var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);

module.exports = function (sequelize, DataTypes){
  var User = sequelize.define('User', {
    // These are Attributes//
    email: { 
      type: DataTypes.STRING, 
      unique: true, 
      validate: {
        len: [6, 30], // <--- validates length
      }
    },
    passwordDigest: {
      type:DataTypes.STRING,
      validate: {
        notEmpty: true // validates precense
      }
    }
  },
   
   // These are the End of the Attributes

  {
    instanceMethods: {
      // these run on a particular user, e.g an instance
      checkPassword: function(password) {
        return bcrypt.compareSync(password, this.passwordDigest);
      }
    },
    classMethods: {
      //these run on User, eg, db.User.createSecure("jjj@gmail.com", "jjj")
      
      // this is a helper method for createSecure
      encryptPassword: function(password) {
        var hash = bcrypt.hashSync(password, salt);
        return hash;
      },

      //START HERE
      createSecure: function(email, password) {
        //check the password length
        if(password.length < 6) {
          throw new Error("Password too short");
        }
        //then return the created Object
        return this.create({
          email: email,
          passwordDigest: this.encryptPassword(password)
        });                // this calls a hashing function on password

      },
      authenticate: function(email, password) {
        // find a user in the DB
        return this.find({
          where: {
            email: email
          }
        }) 
        .then(function(user){
          if (user === null){
            throw new Error("Username does not exist");
          }
          else if (user.checkPassword(password)) {
            return user;
          }

        });
      }

    } // close classMethods
  }); // close define user
  return User;
}; // close User function