require("dotenv").config();

module.exports = {
  development: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
  },
  test: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
  },
  production: {
    //this was put in place for heroku so we might have to change it 
    //we will need to grab the credentials from namecheap 
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
   dialectOptions: {
    ssl: { rejectUnauthorized: false,
            require:true},
 }
  },
};

// ssl: {
//   require: true, // This will help you. But you will see nwe error
//   rejectUnauthorized: false // This line will fix new error
// }