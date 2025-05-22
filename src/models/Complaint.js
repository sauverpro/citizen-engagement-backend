export default (sequelize, DataTypes) => {
  const Complaint = sequelize.define('Complaint', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'assigned', 'in_progress', 'resolved'),
      defaultValue: 'pending'
    },
    attachments: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    agencyId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  });

  Complaint.associate = (models) => {
    Complaint.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Complaint.belongsTo(models.Agency, {
      foreignKey: 'agencyId',
      as: 'agency'
    });
  };

  return Complaint;
};