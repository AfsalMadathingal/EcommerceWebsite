const user = require('../model/userModel.js')


const isLogin = async function (req, res, next) {
  

  if (req.session.user_id) {

    res.redirect("/user_home");

  } else {

    res.redirect("/home");

  }
};

const isLogout = function(req,res,next){

    if (req.session.user_id)
    {

            res.redirect('/home')
    }else
    {
        next()
    }


}


const checkSession =async function (req,res,next){

    const userData = await user.findOne({ _id: req.session.user_id });
    
    if(req.session.user_id)
    {
        if (userData.is_Blocked) {
    
            req.session.user_id= null
            
            res.redirect('/')
              
            } else {
                next()
            }
       
    }
    else
    {
        res.redirect('/')

    }
}

const checkLoginUser = function (req,res,next){

    if(req.session.user_id)
    {
        res.redirect('/user_home')
    }
    else
    {
        next()

    }
}


const blockChecker = async(req,res)=>{
try {
    
    const userData = await user.findOne({ _id: req.session.user_id });

    if (userData.is_Blocked) {
    
        req.session.user_id= null
        
        res.json(true)
          
        } else {

            res.json(false)
        }



} catch (error) {
    

    res.json(false)
}
    


}

module.exports = {
    isLogin,
    isLogout,
    checkSession,
    checkLoginUser,
    blockChecker
}