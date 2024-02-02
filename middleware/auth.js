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


const blockChecker = async (req, res) => {
    try {
        if (req.session.user_id) 
        {
            const userData = await user.findOne({ _id: req.session.user_id });

            if (userData.is_Blocked) {
                req.session.user_id = null;
                res.json({ isBlocked: true });
            } else {
                res.json({ isBlocked: false });
            }
        }
    } catch (error) {
        res.json({ isBlocked: false });
    }
};


const liveChecker = async (req, res) => {
    try {
        const { inputString } = req.body;
        console.log(inputString);

        const allNumbersRegex = /^[0-9]+$/;
        const mixedRegex = /[a-zA-Z0-9]/;

        try {
            if (allNumbersRegex.test(inputString)) {

                const response = await user.findOne({ phone: inputString });

                if (response) {
                    res.json(true);
                } else {
                    res.json(false);
                }
                console.log("all numbers", allNumbersRegex.test(inputString));
            } else if (mixedRegex.test(inputString)) {
                const responseTwo = await user.findOne({ email: inputString });

                if (responseTwo) {
                    res.json(true);
                } else {
                    res.json(false);
                }
                console.log("mixed", mixedRegex.test(inputString));
            }
        } catch (databaseError) {
            console.error("Error during database query:", databaseError);
            res.status(500).json({ error: "Internal Server Error (Database)" });
        }

    } catch (error) {
        console.error("Error in liveChecker function:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};




module.exports = {
    isLogin,
    isLogout,
    checkSession,
    checkLoginUser,
    blockChecker,
    liveChecker,
   
}