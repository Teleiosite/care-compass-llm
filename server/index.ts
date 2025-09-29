import express from 'express';
import pool from './db.js';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3000;

// Create a write stream (in append mode)
const logStream = fs.createWriteStream(path.join(process.cwd(), 'server.log'), { flags: 'a' });

// Middleware to log requests
app.use((req, res, next) => {
  logStream.write(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}\n`);
  logStream.write(`Request Body: ${JSON.stringify(req.body, null, 2)}\n`);
  next();
});

// Define interfaces for database tables
interface Patient {
  id: number;
  age: number;
  gender: string;
  weight: number;
  height: number;
  bmi: number;
}

interface Medication {
  id: number;
  patient_id: number;
  drug_name: string;
  dosage: string;
  frequency: string;
}

// Middleware to parse JSON bodies
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// Get all patients
app.get('/api/patients', async (req, res) => {
  try {
    const result = await pool.query<Patient>('SELECT * FROM patients ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    logStream.write(`Error fetching patients: ${err}\n`);
    res.status(500).send('Error fetching patients');
  }
});

// Create a new patient
app.post('/api/patients', async (req, res) => {
  const {
    age, gender, weight, height, bmi,
    diabetes_duration, complications, comorbidities,
    medications,
    hba1c, glucose, lipids, kidney_function,
    frailty_assessment, adl_independence
  } = req.body;

  logStream.write('Received data for new patient creation.\n');

  const client = await pool.connect();
  logStream.write('Database client connected.\n');

  try {
    await client.query('BEGIN');
    logStream.write('BEGIN transaction.\n');

    const patientQuery = 'INSERT INTO patients (age, gender, weight, height, bmi) VALUES ($1, $2, $3, $4, $5) RETURNING id';
    const patientValues = [age, gender, weight, height, bmi];
    const patientRes = await client.query(patientQuery, patientValues);
    const patientId = patientRes.rows[0].id;
    logStream.write(`Inserted into patients table, new patient ID: ${patientId}\n`);

    const historyQuery = 'INSERT INTO clinical_history (patient_id, diabetes_duration, complications, comorbidities) VALUES ($1, $2, $3, $4)';
    const historyValues = [patientId, diabetes_duration, complications, comorbidities];
    await client.query(historyQuery, historyValues);
    logStream.write('Inserted into clinical_history table.\n');

    if (medications && medications.length > 0) {
      for (const med of medications) {
        const medQuery = 'INSERT INTO medications (patient_id, drug_name, dosage, frequency) VALUES ($1, $2, $3, $4)';
        const medValues = [patientId, med.drug_name, med.dosage, med.frequency];
        await client.query(medQuery, medValues);
        logStream.write(`Inserted medication: ${med.drug_name}\n`);
      }
    }

    const labQuery = 'INSERT INTO lab_results (patient_id, hba1c, glucose, lipids, kidney_function) VALUES ($1, $2, $3, $4, $5)';
    const labValues = [patientId, hba1c, glucose, lipids, kidney_function];
    await client.query(labQuery, labValues);
    logStream.write('Inserted into lab_results table.\n');

    const functionalQuery = 'INSERT INTO functional_status (patient_id, frailty_assessment, adl_independence) VALUES ($1, $2, $3)';
    const functionalValues = [patientId, frailty_assessment, adl_independence];
    await client.query(functionalQuery, functionalValues);
    logStream.write('Inserted into functional_status table.\n');

    await client.query('COMMIT');
    logStream.write('COMMIT transaction.\n');
    res.status(201).json({ id: patientId, message: 'Patient created successfully' });

  } catch (err) {
    await client.query('ROLLBACK');
    logStream.write(`Error during patient creation, ROLLED BACK: ${err}\n`);
    res.status(500).json({ message: 'Error creating patient', error: err.message });
  } finally {
    client.release();
    logStream.write('Database client released.\n');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
