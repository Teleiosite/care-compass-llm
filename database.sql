CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    age INT,
    gender VARCHAR(50),
    weight FLOAT,
    height FLOAT,
    bmi FLOAT
);

CREATE TABLE clinical_history (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id),
    diabetes_duration INT,
    complications TEXT,
    comorbidities TEXT
);

CREATE TABLE medications (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id),
    drug_name VARCHAR(100),
    dosage VARCHAR(50),
    frequency VARCHAR(50)
);

CREATE TABLE lab_results (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id),
    hba1c FLOAT,
    glucose FLOAT,
    lipids VARCHAR(100),
    kidney_function VARCHAR(100)
);

CREATE TABLE functional_status (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id),
    frailty_assessment VARCHAR(100),
    adl_independence VARCHAR(100)
);

CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id),
    alert_message TEXT,
    severity VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
