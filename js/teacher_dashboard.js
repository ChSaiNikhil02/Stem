document.addEventListener('DOMContentLoaded', function() {
    const scoresContainer = document.getElementById('scores-list');

    // Fetch average scores for math
    fetch('/api/subjects/math')
        .then(response => response.json())
        .then(data => {
            const subjectDiv = document.createElement('div');
            subjectDiv.className = 'subject-score';
            subjectDiv.innerHTML = `<h3>Math</h3><p>${data.avg_score || 'N/A'}</p>`;
            scoresContainer.appendChild(subjectDiv);
        })
        .catch(error => {
            console.error('Error fetching average scores:', error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'subject-score';
            errorDiv.innerHTML = `<h3>Math</h3><p>Error</p>`;
            scoresContainer.appendChild(errorDiv);
        });

    // Fetch average scores for biology
    fetch('/api/subjects/biology')
        .then(response => response.json())
        .then(data => {
            const subjectDiv = document.createElement('div');
            subjectDiv.className = 'subject-score';
            subjectDiv.innerHTML = `<h3>Biology</h3><p>${data.avg_score || 'N/A'}</p>`;
            scoresContainer.appendChild(subjectDiv);
        })
        .catch(error => {
            console.error('Error fetching average scores:', error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'subject-score';
            errorDiv.innerHTML = `<h3>Biology</h3><p>Error</p>`;
            scoresContainer.appendChild(errorDiv);
        });

    const container = document.getElementById('student-list-container');
    const loadingMessage = document.getElementById('loading-message');
    const classFilter = document.getElementById('class-filter');

    let allStudents = []; // To store the fetched student data

    // Fetch student data from the backend
    fetch('/api/students')
        .then(response => response.json())
        .then(data => {
            allStudents = data;
            loadingMessage.style.display = 'none';
            renderStudentCards(allStudents);
        })
        .catch(error => {
            console.error('Error fetching student data:', error);
            loadingMessage.textContent = 'Failed to load student data.';
        });

    // Function to render the student cards
    function renderStudentCards(students) {
        container.innerHTML = ''; // Clear existing cards
        if (students.length === 0) {
            container.innerHTML = '<p>No students found for the selected class.</p>';
            return;
        }

        students.forEach(student => {
            const card = document.createElement('div');
            card.className = 'student-card';

            const name = document.createElement('h3');
            name.textContent = student.fullname;

            const email = document.createElement('p');
            email.textContent = `Email: ${student.email}`;

            const studentClass = document.createElement('p');
            studentClass.textContent = `Class: ${student.class}`;

            const uid = document.createElement('p');
            uid.className = 'uid';
            uid.textContent = `ID: ${student.uid}`;

            card.appendChild(name);
            card.appendChild(email);
            card.appendChild(studentClass);
            card.appendChild(uid);

            container.appendChild(card);
        });
    }

    // Event listener for the class filter
    classFilter.addEventListener('change', () => {
        const selectedClass = classFilter.value;
        if (selectedClass === 'all') {
            renderStudentCards(allStudents);
        } else {
            const filteredStudents = allStudents.filter(student => student.class === selectedClass);
            renderStudentCards(filteredStudents);
        }
    });
});