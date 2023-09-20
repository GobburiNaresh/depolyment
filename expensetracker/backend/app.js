const path = require('path');

const express = require('express');

const sequelize = require('./util/database');

const bodyParser = require('body-parser');

const User = require('./models/signup');
const Expense = require('./models/expense');
const Order = require('./models/orders');
const Forgotpassword = require('./models/resetpassword');
const records = require('./models/downloadrecords')

const app = express();

var cors = require('cors');
app.use(cors());



const dotenv = require('dotenv');
dotenv.config();


const userRoutes = require('./routes/signup');
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const premiumRoutes = require('./routes/premiumFeature');
const resetPasswordRoutes = require('./routes/resetpassword')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



app.use('/user', userRoutes);
app.use('/expense',expenseRoutes);
app.use('/purchase',purchaseRoutes);
app.use('/premium',premiumRoutes);
app.use('/password', resetPasswordRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);



sequelize
.sync()
  .then(result => {
    app.listen(process.env.PORT);
  })
  .catch(err => {
    console.log(err);
  });



