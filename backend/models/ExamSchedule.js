module.exports = (sequelize, DataTypes) => {
  const ExamSchedule = sequelize.define('ExamSchedule', {
    examId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      field: 'exam_id'
    },
    examName: {
      type: DataTypes.STRING(180),
      allowNull: false,
      field: 'exam_name'
    },
    registrationStart: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'registration_start'
    },
    registrationEnd: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'registration_end'
    },
    examDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'exam_date'
    },
    resultDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'result_date'
    }
  }, {
    tableName: 'exam_schedules'
  })

  return ExamSchedule
}

