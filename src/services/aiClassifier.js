// server/services/aiClassifier.js
import natural from 'natural';
const classifier = new natural.BayesClassifier();

// Train with sample data (expand for production)
classifier.addDocument('garbage not collected', 'sanitation');
classifier.addDocument('pothole on main street', 'roads');
classifier.addDocument('water pipe leaking', 'utilities');
classifier.addDocument('trash overflow', 'sanitation');
classifier.addDocument('street light broken', 'utilities');
classifier.addDocument('road blocked', 'roads');
classifier.train();

export const categorizeComplaint = async (text) => {
  return classifier.classify(text);
};

export const getCategoryProbabilities = async (text) => {
  return classifier.getClassifications(text);
};