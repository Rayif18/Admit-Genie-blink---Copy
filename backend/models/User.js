module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      field: 'user_id'
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    educationLevel: {
      type: DataTypes.STRING(120),
      allowNull: true,
      field: 'education_level'
    },
    preferences: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cetRank: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'cet_rank'
    },
    category: {
      type: DataTypes.STRING(60),
      allowNull: true
    }
  }, {
    tableName: 'users',
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] }
      }
    }
  })

  return User
}

