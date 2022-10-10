const mongoose= require('mongoose')

const dbCannect=url=>{
    return mongoose.connect(url)
}
module.exports= dbCannect