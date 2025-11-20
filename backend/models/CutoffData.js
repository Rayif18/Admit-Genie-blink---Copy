module.exports = (sequelize, DataTypes) => {
  const CutoffData = sequelize.define('CutoffData', {
    cutoffId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      field: 'cutoff_id'
    },
    collegeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'college_id'
    },
    courseId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'course_id'
    },
    category: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    minRank: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'min_rank'
    },
    maxRank: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'max_rank'
    },
    avgRank: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'avg_rank'
    }
  }, {
    tableName: 'cutoff_data'
  })

  return CutoffData
}

