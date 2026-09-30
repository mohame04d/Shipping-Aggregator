export default (err,req,res,next)=>{
    return res.status(err.statusCode).json({
        message:err.message,
        status:err.status,
        stack:err.stack
    })
}