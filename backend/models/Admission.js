module.exports = (sequelize, DataTypes) => {
  const Admission = sequelize.define('Admission', {
    admissionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      field: 'admission_id'
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
    deadline: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    requiredExam: {
      type: DataTypes.STRING(120),
      allowNull: true,
      field: 'required_exam'
    },
    admissionLink: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'admission_link'
    }
  }, {
    tableName: 'admissions'
  })

  return Admission
}

