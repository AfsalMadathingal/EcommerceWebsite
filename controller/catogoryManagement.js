// requiring category model file
const categoryDB= require('../model/categoryModel.js')


const loadCategory = async (req,res)=>{

    try
    {

        const data = await categoryDB.aggregate([
          {
            $lookup: {
              from: "product_details",
              foreignField: "category_id",
              localField: "_id",
              as: "totalProduct",
            },
          },
          {
            $unwind: {
              path: "$totalProduct",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $group: {
              _id: {
                categoryId: "$_id",   // Include category's object ID
                category: "$category",
              },
              totalProducts: { $sum: { $cond: { if: "$totalProduct", then: 1, else: 0 } } },
           } },
        ]);

        console.log(data);
        const count = await categoryDB.countDocuments()
        res.render('admin/categoryManage',
        {adminlogin:true ,data:data ,count:count,pageTitle:"Category" ,layout:'newSidebar'})
    }
    catch(error)
    {
        res.redirect('/admin')
        console.log(error);

    }


}


const addCategory = async (req, res) => {

  try {

    await categoryDB.insertMany({ category: req.body.categoryName });
    res.redirect("/admin/category_management");
  } catch(error) {

    res.render("errorpage");
    
  }

}

const deleteCategory = async(req,res)=>{

  const categoryId= req.body.categoryId
  await categoryDB.deleteOne({_id:categoryId})

  res.end()
}

const editCategory = async (req, res) => {
  try {
    const categoryName = req.body.categoryName;
    const newCategoryName = req.body.newCategoryName;
    await categoryDB.updateOne(
      { category: categoryName },
      { $set: { category: newCategoryName } }
    );

    console.log("edit category is working");

    res.redirect("/admin/category_management");
  } catch (error) {
    res.send("something error please go back to home");
  }
};


module.exports={
    loadCategory,
    addCategory,
    deleteCategory,
    editCategory
}
