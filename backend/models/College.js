module.exports = (sequelize, DataTypes) => {
  const College = sequelize.define('College', {
    collegeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      field: 'college_id'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    accreditation: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    ranking: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'colleges'
  })

  return College
}

