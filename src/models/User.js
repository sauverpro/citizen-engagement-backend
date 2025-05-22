export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('citizen', 'admin', 'agency'),
      defaultValue: 'citizen'
    },
    agencyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Agencies',
        key: 'id'
      }
    }
  });

  User.associate = (models) => {
    User.belongsTo(models.Agency, {
      foreignKey: 'agencyId',
      as: 'agency'
    });
    User.hasMany(models.Complaint, {
      foreignKey: 'userId',
      as: 'complaints'
    });
  };

  return User;
};