module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    adminId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      field: 'admin_id'
    },
    username: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('super_admin', 'admin'),
      allowNull: false,
      defaultValue: 'admin'
    }
  }, {
    tableName: 'admins',
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] }
      }
    }
  })

  return Admin
}

