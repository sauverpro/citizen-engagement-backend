import models from '../config/database.js';

const seedAgencies = async () => {
  await models.Agency.bulkCreate([
    {
      name: "Sanitation Department",
      categories: "sanitation,waste",
      contactEmail: "sanitation@city.gov"
    },
    {
      name: "Road Maintenance",
      categories: "roads,potholes",
      contactEmail: "roads@city.gov"
    },
    {
      name: "Public Utilities",
      categories: "water,electricity",
      contactEmail: "utilities@city.gov"
    }
  ]);
  console.log('Agencies seeded successfully');
};

export default seedAgencies;