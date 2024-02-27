const products = require("../model/productsModel.js");
const size = require("../model/sizeModel.js");
const color = require("../model/colorModel.js");
const category = require("../model/categoryModel.js");
const productVariants = require("../model/productVariants.js");
const user = require("../model/userModel.js");
const address = require("../model/userAddress.js");
const cart = require("../model/cart.js");
const order = require("../model/orderModel.js");
const payment = require("../model/payment.js");
const mongoose = require("mongoose");
const Adminlayout = "newSidebar";

const loadDahboard = async (req, res) => {
  try {
    const userCount = await user.find({}).count();
    const orderCount = await order.find({}).count();
    const productCount = await productVariants.find({}).count();
    const totalRevenue = await order.aggregate([
      {
        $group: {
          _id: "",
          totalAmount: { $sum: "$orderAmount" },
        },
      },
    ]);

    const { totalAmount } = totalRevenue[0];

    console.log(totalAmount);

    res.render("admin/adminDashboard", {
      adminlogin: true,
      pageTitle: "Dashboard",
      layout: Adminlayout,
      totalAmount: totalAmount,
      userCount: userCount,
      orderCount: orderCount,
      productCount: productCount,
    });
  } catch (error) {
    console.log(error);
  }
};

const chartData = async (req, res) => {
  try {
    let { filter } = req.body;

    filter = Number(filter);

    const grouped = await order.aggregate([
      {
        $match: {
          orderDate: {
            $exists: true, 
          },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$orderDate",
              },
            },
          },
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: "$orderAmount" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        },
      },
      {
        $sort: {
          "_id.date": 1,
        },
      },
      {
        $limit: filter,
      },
    ]);

    console.log(filter);

    res.json(grouped);
  } catch (error) {
    console.log(error);
  }
};

const salesreport = async (req, res) => {
  try {
    const { range } = req.params;
    let data;
    let daily;
    let weekly;
    let yearly;

    if (range == "r1") {
      const dailyReport = await order.aggregate([
        {
          $lookup: {
            from: "user_details",
            foreignField: "_id",
            localField: "userId",
            as: "userDetails",
          },
        },
        {
          $project: {
            _id: 1,
            orderAmount: 1,
            orderDate: {
              $dateToString: {
                format: "%d-%m-%Y",
                date: "$orderDate",
              },
            },
            userName: { $arrayElemAt: ["$userDetails.name", 0] },
            orderNo: 1,
          },
        },
        {
          $group: {
            _id: "$orderDate",
            totalOrders: { $sum: 1 },
            totalAmount: { $sum: "$orderAmount" },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);

      daily = true;
      data = dailyReport;
    } else if (range == "r7") {
      const weeklyReport = await order.aggregate([
        {
          $lookup: {
            from: "user_details",
            foreignField: "_id",
            localField: "userId",
            as: "userDetails",
          },
        },
        {
          $project: {
            _id: 1,
            orderAmount: 1,
            orderDate: {
              $dateToString: {
                format: "%d-%m-%Y",
                date: "$orderDate",
              },
            },
            userName: { $arrayElemAt: ["$userDetails.name", 0] },
            orderNo: 1,
          },
        },
        {
          $sort: {
            orderDate: 1,
          },
        },
        {
          $project: {
            week: {
              $isoWeek: {
                $dateFromString: {
                  dateString: "$orderDate",
                  format: "%d-%m-%Y",
                },
              },
            },
            orderAmount: 1,
            orderNo: 1,
            orderDate: {
              $dateFromString: { dateString: "$orderDate", format: "%d-%m-%Y" },
            },
          },
        },
        {
          $group: {
            _id: { week: "$week" },
            start_date: { $min: "$orderDate" },
            end_date: { $max: "$orderDate" },
            totalAmount: { $sum: "$orderAmount" },
            totalOrders: { $sum: 1 },
          },
        },
        {
          $project: {
            "_id.week": 1,
            start_date: {
              $dateToString: { format: "%d-%m-%Y", date: "$start_date" },
            },
            end_date: {
              $dateToString: { format: "%d-%m-%Y", date: "$end_date" },
            },
            totalAmount: 1,
            totalOrders: 1,
          },
        },
        {
          $sort: {
            "_id.week": 1,
          },
        },
        {
          $project: {
            _id: 0,
            week: "$_id.week",
            start_date: 1,
            end_date: 1,
            totalAmount: 1,
          }
        }
      ]);

      data = weeklyReport;
      weekly = true;
    } else if (range == "r365") {
      const monthlyReport = await order.aggregate([
        {
          $lookup: {
            from: "user_details",
            foreignField: "_id",
            localField: "userId",
            as: "userDetails",
          },
        },
        {
          $project: {
            _id: 1,
            orderAmount: 1,
            orderDate: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$orderDate",
              },
            },
            userName: { $arrayElemAt: ["$userDetails.name", 0] },
            orderNo: 1,
          },
        },
        {
          $sort: {
            orderDate: 1,
          },
        },
        {
          $project: {
            month: {
              $dateToString: {
                format: "%Y/%m",
                date: {
                  $dateFromString: {
                    dateString: "$orderDate",
                    format: "%Y-%m-%d",
                  },
                },
              },
            },
            orderAmount: 1,
            orderNo: 1,
          },
        },
        {
          $group: {
            _id: { month: "$month" },
            totalAmount: { $sum: "$orderAmount" },
            totalOrders: { $sum: 1 },
          },
        },
        {
          $sort: {
            "_id.month": 1,
          },
        },
      ]);

      data = monthlyReport;
      yearly = true;
    }



    console.log(data);

    const start_date = data[0].start_date;
    const end_date = data[data.length - 1].end_date;

    res.render("admin/salesReport", {
      adminlogin: true,
      layout: Adminlayout,
      reportData: data,
      pageTitle: "Reports",
      title: "Sales Report",
      daily: daily,
      weekly: weekly,
      yearly: "yearly",
      start_date: start_date,
      end_date: end_date,
      
    });
  } catch (error) {
    console.log(error);
  }
};

const salesReportFilter = async (req, res) => {
  const { fromDate, toDate } = req.body;

  try {
    console.log(fromDate, toDate);
    const userStartDateString = fromDate;
    const userEndDateString = toDate;
    let [startMonth, startDay, startYear] = userStartDateString.split("/");
    let [endMonth, endDay, endYear] = userEndDateString.split("/");

    const userStartDate = new Date(`${startYear}-${startMonth}-${startDay}`);
    const userEndDate = new Date(`${endYear}-${endMonth}-${endDay}`);

    console.log("User Start Date:", userStartDate);
    console.log("User End Date:", userEndDate);

    const pipeline = [
      {
        $match: {
          orderDate: {
            $gte: userStartDate,
            $lte: userEndDate,
          },
        },
      },
      {
        $project: {
          _id: 1,
          orderAmount: 1,
          orderDate: {
            $dateToString: {
              format: "%d-%m-%Y",
              date: "$orderDate",
            },
          },
          orderStatus: 1,
        },
      },
    ];

    const data = await order.aggregate(pipeline);

  
    res.json(data);
   
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while generating the report");
  }
};

module.exports = {
  loadDahboard,
  chartData,
  salesreport,
  salesReportFilter,
};
