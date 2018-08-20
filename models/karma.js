module.exports = (sequelize, DataTypes) => sequelize.define(
  'karma',
  {
    user_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    karma: DataTypes.INTEGER,
  },
  {
    freezeTableName: true,
    timestamps: false,
  },
);
