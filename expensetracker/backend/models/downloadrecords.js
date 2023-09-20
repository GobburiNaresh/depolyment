const Sequelize = require('sequelize');

const sequelize = require('../util/database');

  const records = sequelize.define('downloadRecords', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    user_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    file_url:{
        type: Sequelize.STRING,
        allowNull: false,

    },
    download_date:{
        type: Sequelize.DATE,
        allowNull: false,

    }
  })
    module.exports = records;