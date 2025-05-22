import { initApp } from './app.js';

const PORT = process.env.PORT || 5000;

initApp().then(app => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});