module.exports = (sequelize, DataTypes) => sequelize.define(
  'swears',
  {
    user_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    swears: DataTypes.INTEGER,
  },
  { freezeTableName: true, timestamps: false },
);
