fetch('/api/patients')
    .then(response => response.json())
    .then(patients => {
        const patientsDiv = document.getElementById('patients');
        patients.forEach(patient => {
            const patientDiv = document.createElement('div');
            patientDiv.innerHTML = `
                <h2>${patient.name}</h2>
                <p>Date of Birth: ${patient.date_of_birth}</p>
                <p>Contact Info: ${patient.contact_info}</p>
            `;
            patientsDiv.appendChild(patientDiv);
        });
    });