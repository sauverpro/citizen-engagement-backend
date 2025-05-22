export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('Complaints', 'agencyId', {
    type: Sequelize.INTEGER,
    allowNull: true
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('Complaints', 'agencyId');
}
