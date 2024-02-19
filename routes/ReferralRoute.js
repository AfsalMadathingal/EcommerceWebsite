const user = require("../model/userModel");
const express = require("express");
const referralRoute = express.Router();



referralRoute.get("/", (req, res) => 
{
    try {

        if (req.session.user_id) {

            return res.status(405).redirect("/user_home");
         } 
     
         const {ref} = req.query
         
         req.session.referralId= ref

         res.status(200).redirect("/user_signup")
        
    } catch (error) {
        
        console.log(error);

    }

   
})



module.exports = referralRoute;
