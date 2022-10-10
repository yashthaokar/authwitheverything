const express= require('express')
const cors= require('cors')
const cookieParser = require('cookie-parser')
const User= require('./routes/userRoute')
const fileUpload = require('express-fileupload')

const app= express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(fileUpload({
    limits:{fileSize:50*1024*1024},
    useTempFiles:true,
}))

//using routes
app.use('/api/v1',User)
app.get("/",(req,res)=>{
    res.send("server is working Y@shCode")
})






module.exports= app