
const checkSession = (req,res,next)=>{


    console.log("admin",req.session);

    if(req.session.admin_id)
    {
        next()
       
    }else
    {
        next()
      //  res.redirect('/admin')
    }

}

module.exports ={
    checkSession
}