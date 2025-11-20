module.exports = (sequelize, DataTypes) => {
  const ChatHistory = sequelize.define('ChatHistory', {
    chatId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      field: 'chat_id'
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'user_id'
    },
    queryText: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'query_text'
    },
    botResponse: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'bot_response'
    }
  }, {
    tableName: 'chat_history'
  })

  return ChatHistory
}

