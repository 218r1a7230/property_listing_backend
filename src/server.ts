import mongoose from 'mongoose';
import app from './app';
import config from './config/config';

mongoose.connect(config.mongodbUri)
  .then(() => {
    console.log('Connected to MongoDB');
    const port = config.port || 3000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });