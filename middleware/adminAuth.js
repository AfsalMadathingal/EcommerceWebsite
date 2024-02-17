
const checkSession = (req,res,next)=>{


    console.log("admin",req.session);

    if(req.session.admin_id)
    {
        next()
       
    }else
    {
        res.redirect('/admin')
    }

}

module.exports ={
    checkSession
}