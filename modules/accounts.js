const sqlite = require("sqlite-async");



module.exports = class Account {
    
    constructor(dbName = ":memory:"){
        // create database if not yet existing
        return (async() => {
            this.db = await sqlite.open(dbName);
            const sql = "CREATE TABLE IF NOT EXISTS users(\
id INTEGER PRIMARY KEY AUTOINCREMENT,\
email VARCHAR(345) NOT NULL,\
username VARCHAR(30) NOT NULL,\
password VARCHAR(60) NOT NULL,\
admin BOOLEAN NOT NULL CHECK (admin IN (0,1)));";
            await this.db.run(sql);
            return this;
        })()
    }
    
    //REGISTER NEW USER
    async register(email, username, password){
        
        
        
    }
    
    //LOGIN USER
    async login(emailusername, password){
        
        
        
    }
    
    
    async close(){
        await this.db.close();
    }
    
}