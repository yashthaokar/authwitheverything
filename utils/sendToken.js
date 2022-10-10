exports.sendToken=(res,user,statusCode,message)=>{
    const token= user.getJWTToken()
    const options={
        httpOnly:true,
       expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE *60*60*1000)//10hr
    }
    const userData={
        _id:user._id,
        name:user.name,
        emial:user.email,
        avatar:user.avatar,
        task:user.task,
        verified:user.verified,
    }

res.status(statusCode).cookie("token",token,options).json({success:true, message,user:userData})

}