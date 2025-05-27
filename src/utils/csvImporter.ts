// src/utils/csvImporter.ts
import csv from 'csv-parser';
import fs from 'fs';
import mongoose from 'mongoose';
import Property, { IProperty } from '../models/Property';
import logger from './logger';

interface CSVProperty {
  title: string;
  description: string;
  price: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
  yearBuilt: string;
  [key: string]: string; // For additional fields
}

export async function importPropertiesFromCSV(filePath: string): Promise<string> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV file not found at path: ${filePath}`);
  }

  const results: CSVProperty[] = [];
  let importedCount = 0;
  
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data: CSVProperty) => results.push(data))
      .on('error', (error) => {
        logger.error('CSV stream error:', error);
        reject(error);
      })
      .on('end', async () => {
        try {
          if (results.length === 0) {
            throw new Error('No data found in CSV file');
          }

          // Transform and validate data
          const properties: Omit<IProperty, '_id' | 'createdAt' | 'updatedAt'>[] = results.map(item => {
            const transformed = {
              title: item.title.trim(),
              description: item.description.trim(),
              price: parseFloat(item.price) || 0,
              address: item.address.trim(),
              city: item.city.trim(),
              state: item.state.trim(),
              zipCode: item.zipCode.trim(),
              bedrooms: parseInt(item.bedrooms) || 0,
              bathrooms: parseInt(item.bathrooms) || 0,
              propertyType: item.propertyType.trim(),
              yearBuilt: parseInt(item.yearBuilt) || new Date().getFullYear(),
              createdBy: new mongoose.Types.ObjectId(), // Default admin user
            };

            // Validate required fields
            if (!transformed.title || !transformed.description || !transformed.address) {
              throw new Error(`Missing required fields in property: ${JSON.stringify(item)}`);
            }

            return transformed;
          });

          // Clear existing data (optional)
          await Property.deleteMany({});

          // Batch insert
          const batchSize = 100;
          for (let i = 0; i < properties.length; i += batchSize) {
            const batch = properties.slice(i, i + batchSize);
            await Property.insertMany(batch);
            importedCount += batch.length;
            logger.info(`Imported ${batch.length} properties (total: ${importedCount})`);
          }

          resolve(`Successfully imported ${importedCount} properties`);
        } catch (error) {
          logger.error('Import failed:', error);
          reject(error);
        } finally {
          mongoose.disconnect().catch(err => logger.error('MongoDB disconnect error:', err));
        }
      });
  });
}

// Standalone execution support
if (require.main === module) {
  (async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/property-listing');
      logger.info('Connected to MongoDB');
      
      const filePath = process.argv[2] || './property_data.csv';
      const result = await importPropertiesFromCSV(filePath);
      logger.info(result);
      process.exit(0);
    } catch (error) {
      logger.error('Import failed:', error);
      process.exit(1);
    }
  })();
}