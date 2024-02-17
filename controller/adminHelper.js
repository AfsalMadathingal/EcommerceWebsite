// requiring admin model file
const adminDB = require("../model/AdminModel.js");

// requiring admin model file
const userDB = require("../model/userModel.js");

// for decrypt/encrypt for password
const bcrypt = require("bcrypt");
const saltRounds = 10;
const Adminlayout = "newSidebar";

const verifyAdmin = async function (req, res) {
  const admin_id = req.body.admin_id;
  const password = req.body.password;

  console.log("pass",req.body);

  try {
    const adminData = await adminDB.findOne({ admin_id: admin_id });

    if (adminData) {
      let cryptResult = await bcrypt.compare(password, adminData.password);

      if (cryptResult) {
        req.session.admin_id = adminData.admin_id;

        res.redirect("/admin/dashboard");
        
      } else {
        req.session.wrongAdmin = true;
        res.redirect("/admin");
      }
    } else {
      req.session.wrongAdmin = true;
      res.redirect("/admin");
    }
  } catch (err) {
    console.log(err);
    res.send("error catch in verify user");
  }
};

const loadadminLogin = (req, res) => {


  
  if (req.session.admin_id) {
    res.render("admin/adminDashboard", {
      adminlogin: true,
      pageTitle: "Dashboard",
      layout: "newSidebar",
    });
  } else {
    res.render("admin/loginPage", {
      admin: true,
      alert: req.session.wrongAdmin,
      layout: "adminLoginLayout",
    });
    req.session.wrongAdmin = false;
  }
};

//log out admin and send to home
const logout = function (req, res) {
  if (req.session.admin_id) {
    req.session.admin_id = null;
    res.redirect("/admin");
  } else {
    res.redirect("/admin");
  }
};



const loadUserManagement = async (req, res) => {
  try {
    // Getting user Data from the database
    let usersData = await userDB.find({});

    // Counting the user
    const count = await userDB.countDocuments({});

    usersData.forEach((element) => {
      // Provided date string
      const dateString = element.date_joined;

      // Create a new Date object from the provided string
      const dateObject = new Date(dateString);

      // Get day, month, and year
      const day = dateObject.getDate();
      const month = dateObject.getMonth() + 1; // Note: Months are zero-indexed, so we add 1
      const year = dateObject.getFullYear();

      // Format the date components
      const formattedDate = `${day}/${month}/${year}`;

      element.datejoined = formattedDate;
    });


    res.render("admin/userDetails", {
      adminlogin: true,
      usersData: usersData,
      count: count,
      pageTitle: "Users",
      layout: "newSidebar",
    });
  } catch (err) {
    res.redirect("/admin");
  }
};

const blockUser = async (req, res) => {
  const userid = req.body.userId;

  await userDB.updateOne({ _id: userid }, { $set: { is_Blocked: true } });
  res.end();
};

const unblockUser = async (req, res) => {
  const userid = req.body.userId;

  await userDB.updateOne({ _id: userid }, { $set: { is_Blocked: false } });

  res.end();
};

const categoryManagement = async (req, res) => {
  try {
    //getting user Data from database
    const usersData = await userDB.find({});
    //counting the user
    const count = await userDB.countDocuments({});
    res.render("admin/userDetails", {
      adminlogin: true,
      usersData: usersData,
      count: count,
      layout: "newSidebar",
    });
  } catch (err) {
    res.redirect("/admin");
  }
};




module.exports = {
  verifyAdmin,
  loadadminLogin,
  logout,
  loadUserManagement,
  blockUser,
  unblockUser,
  categoryManagement,
  
};
