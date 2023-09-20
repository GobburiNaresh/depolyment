const Expense = require('../models/expense');
const User = require('../models/signup');
const sequelize = require('../util/database');
const S3Services = require('../services/s3services');
const UserServices=require("../services/userServices");
const db = require('../models/downloadrecords')

const addExpense = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
      const { price, description, category } = req.body;
  
      if (price == undefined || price.length <= 0) {
        return res.status(400).json({ success: false, message: 'parameters missing' });
      }
  
      const expense = await Expense.create({ price, description, category, userDetailId: req.user.id }, { transaction: t });
      const totalExpense = Number(req.user.totalExpenses) + Number(price);
      User.update(
        {
          totalExpenses: totalExpense,
        },
        {
          where: { id: req.user.id },
          transaction: t,
        }
      )
        .then(async () => {
          await t.commit();
          res.status(200).json({
            success: true,
            message: `Successfully created new user`,
            expense: expense,
          });
        })
        .catch(async () => {
          await t.rollback();
          res.status(500).json({ success: false, error: err });
        });
    } catch (err) {
      await t.rollback();
      console.log(err);
      res.status(500).json({ success: false, error: err });
    }
  };
  


const getExpenses = async (req,res)=>{
  console.log("getting => users from Mysql");
  let page=req.query.pageNo || 1;
  console.log(page);
  let itemsPerPage =+ (req.query.items_per_page)|| 2 ;
  console.log(itemsPerPage);
  console.log(req.user.id);
  

  try{
    let count = await Expense.count({ where: { userDetailId: req.user.id } });
    console.log("Count: " + count);
    let totalPages = Math.ceil(count / itemsPerPage);
    const expenses = await Expense.findAll({
      where: { userDetailId: req.user.id },
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
    });
    const currentPage = +page;
    const hasNextPage = totalPages > currentPage;
    const hasPreviousPage = currentPage > 1;
    const nextPage = currentPage + 1;
    const previousPage = currentPage - 1;

    res.status(200).json({
      data: expenses,
      info: {
        currentPage: currentPage,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
        nextPage: hasNextPage ? nextPage : null,
        previousPage: hasPreviousPage ? previousPage : null,
        lastPage: totalPages
      }
    });
  }
catch(err){
    console.log(err);
    res.status(500).json({success:false,err:err})
  }
}

const deleteExpense = (req,res)=>{
    const expenseId = req.params.id;
    if(expenseId == undefined || expenseId.length === 0){
        return res.status(400).json({success: false})
    }
    Expense.destroy({where:{id : expenseId, userDetailId: req.user.id} }).then((noofrows) => {
        if(noofrows === 0){
            return res.status(400).json({success: false,message: 'Expense doesnot belong to user'});
        }
        return res.status(204).json({ success: true,message:"delete successfully"})
    }).catch(err => {
        console.log(err);
        return res.status(403).json({success: false,message:failed})
    })
    
}

const editExpense = async (req, res, next) => {
  try {
    const expenseId = req.params.id;
    const { price, description, category } = req.body; 

    const existingExpense = await Expense.findOne({ where: { id: expenseId, userDetailId: req.user.id } });

    if (!existingExpense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    // Update the expense fields
    existingExpense.price = price;
    existingExpense.description = description;
    existingExpense.category = category;

    await existingExpense.save();

    res.status(200).json({ success: true, message: 'Expense updated successfully', updatedExpense: existingExpense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'An error occurred while updating the expense' });
  }
}


const downloadExpense = async (req,res) => {
  try{
  const userDetailId = req.user.id;
  const expenses = await Expense.findAll({ where: { userDetailId: userDetailId }});
  // const expenses = await UserServices.getExpenses(req);
  // console.log(expenses);
  const stringifiedExpenses = JSON.stringify(expenses);

  console.log('1',stringifiedExpenses)
  const filename = `Expense${userDetailId}/${new Date()}.txt`;
  console.log('2',filename)
  const fileUrl = await S3Services.uploadToS3(stringifiedExpenses, filename);
  console.log(fileUrl)
  res.status(201).json({fileUrl , success: true}) 
}catch(err){
  console.log(err);
res.status(500).json({fileUrl:"Something==>went wrong",success:false})
}
}

module.exports = {
    addExpense,
    getExpenses,
    deleteExpense,
    editExpense,
    downloadExpense,

}