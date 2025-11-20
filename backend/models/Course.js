module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    courseId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      field: 'course_id'
    },
    collegeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'college_id'
    },
    courseName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'course_name'
    },
    duration: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    eligibility: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fees: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    intake: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    }
  }, {
    tableName: 'courses'
  })

  return Course
}

