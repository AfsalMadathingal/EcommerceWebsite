
const checkSession = (req,res,next)=>{



    if(req.session.admin_id)
    {
        next()
       
    }else
    {
        next()
    //    res.redirect('/admin')
    }

}

module.exports ={
    checkSession
}