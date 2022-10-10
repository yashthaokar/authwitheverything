const jwt= require('jsonwebtoken');
const user = require('../models/user');
const User = require('../models/user')

exports.isAuthenticated= async(req,res,next)=>{
    try {
        const {token}=req.cookies;
        if(!token){
            return res.status(401).json({success:false, message:"Loggin to first"})
        }         
        const decoded= jwt.verify(token, process.env.JWT_SECRET)// here we got id which is pass in models this._id
        req.user= await User.findById(decoded._id)
        next()
        
    } catch (error) {
        
    }
}

//verifyed true,
exports.isauthverifyed= async(req,res,next)=>{
    try {
        const {token}=req.cookies;
        if(!token){
            return res.status(401).json({success:false, message:"Loggin to first"})
        }         
        const decoded= jwt.verify(token, process.env.JWT_SECRET)// here we got id which is pass in models this._id
        req.user= await User.findById(decoded._id)
        const check=(user)=>{
           if( user( {verified:ture})){
            res.status(500).json({
                success:false,
                message:"User is not verifyed on mail check mail and veryifyed by Otp."
            })
           }
        }
        res.status(200).json({
            success:true,
            user,
        })
        next()
        
    } catch (error) {
        
    }
}