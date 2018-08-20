module.exports = (sequelize, DataTypes) => sequelize.define(
  'lists',
  {
    user_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    list: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
  },
  { freezeTableName: true, timestamps: false },
);
