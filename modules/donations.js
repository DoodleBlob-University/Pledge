const sqlite = require('sqlite-async')

module.exports = class Donations {
    
    constructor(dbName = ':memory:') {
        // create database table if not yet existing
        return (async() => {
            this.db = await sqlite.open(dbName)
            const sql = ``
            
            //await this.db.run(sql)
            return this
        })()
    }
    
    async donate(encodedData){
        try {
            const data = Buffer.from(encodedData, "base64").toString() // decode
            const [ amount, ccnumber, cvc, ccname, ccexp ] = data.split(":")
            
            console.log( [amount, ccnumber, cvc, ccname, ccexp] )
            
        } catch (error) {
            throw error
        }
    }
    
    async donateCheck(){
        // TODO
        return true
    }
    
    async getDonations(){
        
    }
    
}