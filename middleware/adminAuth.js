
const checkSession = (req,res,next)=>{

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