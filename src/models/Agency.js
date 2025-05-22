export default (sequelize, DataTypes) => {
  const Agency = sequelize.define('Agency', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    categories: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('categories');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('categories', JSON.stringify(value));
      }
    }
  });

  Agency.associate = (models) => {
    Agency.hasMany(models.Complaint, {
      foreignKey: 'agencyId',
      as: 'complaints'
    });
    Agency.hasMany(models.User, {
      foreignKey: 'agencyId',
      as: 'users'
    });
  };

  return Agency;
};