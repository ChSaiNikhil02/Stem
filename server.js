const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_PATH = path.join(__dirname, 'database.json');

let loggedInUserId = null; // Stores the UID of the logged-in user
let loggedInUserType = null; // Stores 'student' or 'teacher'

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// --- API ENDPOINTS ---

// Registration endpoint
app.post('/register', (req, res) => {
    const { user_type, uid, fullname, email, password } = req.body;

    fs.readFile(DB_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading database:", err);
            return res.status(500).send('Server error');
        }

        const db = JSON.parse(data);
        const newUser = { uid, fullname, email, password }; // Note: Storing password as plain text for prototype.

        if (user_type === 'student') {
            newUser.class = req.body.class;
            db.students.push(newUser);
            // Initialize scores for the new student
            if (!db.scores) {
                db.scores = [];
            }
            const subjects = ["math", "science", "social", "english", "physics", "chemistry", "biology"];
            subjects.forEach(subject => {
                db.scores.push({
                    score: 0,
                    subject: subject,
                    timestamp: new Date().toISOString(),
                    student_uid: uid
                });
            });
        } else if (user_type === 'teacher') {
            db.teachers.push(newUser);
        } else {
            return res.status(400).send('Invalid user type');
        }

        fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), (err) => {
            if (err) {
                console.error("Error writing to database:", err);
                return res.status(500).send('Server error');
            }
            console.log('New user registered:', newUser);
            // Redirect to login page after successful registration
            res.redirect('/login.html');
        });
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { id, password } = req.body;

    fs.readFile(DB_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading database:", err);
            return res.status(500).send('Server error');
        }

        const db = JSON.parse(data);
        
        const student = db.students.find(s => s.uid === id && s.password === password);
        if (student) {
            loggedInUserId = student.uid;
            loggedInUserType = 'student';
            console.log('Student logged in:', student.uid);
            return res.redirect('/student_dashboard.html');
        }

        const teacher = db.teachers.find(t => t.uid === id && t.password === password);
        if (teacher) {
            loggedInUserId = teacher.uid;
            loggedInUserType = 'teacher';
            console.log('Teacher logged in:', teacher.uid);
            return res.redirect('/teacher_dashboard.html');
        }

        // If no user is found
        res.status(401).send('Login Failed: Invalid ID or password.');
    });
});

app.post('/save-score', (req, res) => {
    let { score, subject } = req.body;
    // Only students can save scores
    if (loggedInUserType !== 'student' || !loggedInUserId) {
        return res.status(403).send('Unauthorized: Only logged-in students can save scores.');
    }

    if (subject === 'india' || subject === 'world') {
        subject = 'social';
    }
    const newScore = { score, subject, timestamp: new Date().toISOString(), student_uid: loggedInUserId };

    fs.readFile(DB_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading database:", err);
            return res.status(500).send('Server error');
        }

        const db = JSON.parse(data);
        if (!db.scores) {
            db.scores = [];
        }

        // Remove the initial zero score for this subject if it exists
        const initialScoreIndex = db.scores.findIndex(s => s.student_uid === loggedInUserId && s.subject === subject && s.score === 0);
        if (initialScoreIndex !== -1) {
            const initialScore = db.scores[initialScoreIndex];
            // Check if there are other scores for this subject
            const otherScores = db.scores.filter(s => s.student_uid === loggedInUserId && s.subject === subject && s.score !== 0);
            if (otherScores.length === 0) {
                db.scores.splice(initialScoreIndex, 1);
            }
        }

        db.scores.push(newScore);

        fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), (err) => {
            if (err) {
                console.error("Error writing to database:", err);
                return res.status(500).send('Server error');
            }
            console.log('Score saved:', newScore);
            res.status(200).send('Score saved successfully');
        });
    });
});

// API endpoint to get average scores for all subjects for the logged-in student
app.get('/api/average-scores', (req, res) => {
    // Only students can request average scores
    if (loggedInUserType !== 'student' || !loggedInUserId) {
        return res.status(403).send('Unauthorized: Only logged-in students can view average scores.');
    }

    fs.readFile(DB_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading database:", err);
            return res.status(500).send('Server error');
        }
        const db = JSON.parse(data);
        if (db.scores) {
            const studentScores = db.scores.filter(s => s.student_uid === loggedInUserId);
            const subjectScores = {};
            studentScores.forEach(s => {
                if (!subjectScores[s.subject]) {
                    subjectScores[s.subject] = [];
                }
                subjectScores[s.subject].push(parseFloat(s.score));
            });

            const avgScores = {};
            let totalAverageOfSubjectAverages = 0;
            let subjectCount = 0;
            for (const subject in subjectScores) {
                const scores = subjectScores[subject];
                const avg = scores.reduce((acc, val) => acc + val, 0) / scores.length;
                avgScores[subject] = { avg_score: avg.toFixed(2) };
                totalAverageOfSubjectAverages += avg;
                subjectCount++;
            }
            const overallAverage = subjectCount > 0 ? totalAverageOfSubjectAverages / subjectCount : 0;

            res.json({ subject_averages: avgScores, total_average: overallAverage.toFixed(2) });
        } else {
            res.status(404).send('No scores found');
        }
    });
});

// API endpoint to get a specific student's details
app.get('/api/student-details', (req, res) => {
    // Only students can request their own details
    if (loggedInUserType !== 'student' || !loggedInUserId) {
        return res.status(403).send('Unauthorized: Only logged-in students can view their details.');
    }

    fs.readFile(DB_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading database:", err);
            return res.status(500).send('Server error');
        }
        const db = JSON.parse(data);
        const student = db.students.find(s => s.uid === loggedInUserId);
        if (student) {
            res.json(student);
        } else {
            res.status(404).send('Student not found');
        }
    });
});

// API endpoint to get a specific teacher's details
app.get('/api/teacher-details', (req, res) => {
    // Only teachers can request their own details
    if (loggedInUserType !== 'teacher' || !loggedInUserId) {
        return res.status(403).send('Unauthorized: Only logged-in teachers can view their details.');
    }

    fs.readFile(DB_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading database:", err);
            return res.status(500).send('Server error');
        }
        const db = JSON.parse(data);
        const teacher = db.teachers.find(t => t.uid === loggedInUserId);
        if (teacher) {
            res.json(teacher);
        } else {
            res.status(404).send('Teacher not found');
        }
    });
});

// API endpoint for leaderboard
app.get('/api/leaderboard', (req, res) => {
    fs.readFile(DB_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading database:", err);
            return res.status(500).send('Server error');
        }

        const db = JSON.parse(data);
        const students = db.students;
        const scores = db.scores;

        const leaderboardData = students.map(student => {
            const studentScores = scores.filter(score => score.student_uid === student.uid);
            const subjectScores = {};
            studentScores.forEach(s => {
                if (!subjectScores[s.subject]) {
                    subjectScores[s.subject] = [];
                }
                subjectScores[s.subject].push(parseFloat(s.score));
            });

            let totalAverageOfSubjectAverages = 0;
            let subjectCount = 0;
            for (const subject in subjectScores) {
                const subjectAvg = subjectScores[subject].reduce((acc, val) => acc + val, 0) / subjectScores[subject].length;
                totalAverageOfSubjectAverages += subjectAvg;
                subjectCount++;
            }
            const totalScore = subjectCount > 0 ? totalAverageOfSubjectAverages / subjectCount : 0;
            return {
                uid: student.uid,
                fullname: student.fullname,
                class: student.class,
                totalScore: totalScore
            };
        });

        leaderboardData.sort((a, b) => b.totalScore - a.totalScore);

        res.json(leaderboardData);
    });
});

// API endpoint for teacher dashboard stats
app.get('/api/teacher-dashboard-stats', (req, res) => {
    if (loggedInUserType !== 'teacher') {
        return res.status(403).send('Unauthorized: Only teachers can view dashboard stats.');
    }

    fs.readFile(DB_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading database:", err);
            return res.status(500).send('Server error');
        }
        const db = JSON.parse(data);
        
        const totalStudents = db.students ? db.students.length : 0;
        
        let overallAveragePerformance = 0;
        if (db.students && db.students.length > 0) {
            let allStudentsOverallAverages = [];
            db.students.forEach(student => {
                const studentScores = db.scores.filter(score => score.student_uid === student.uid);
                const subjectScores = {};
                studentScores.forEach(s => {
                    if (!subjectScores[s.subject]) {
                        subjectScores[s.subject] = [];
                    }
                    subjectScores[s.subject].push(parseFloat(s.score));
                });

                let totalAverageOfSubjectAverages = 0;
                let subjectCount = 0;
                for (const subject in subjectScores) {
                    const subjectAvg = subjectScores[subject].reduce((acc, val) => acc + val, 0) / subjectScores[subject].length;
                    totalAverageOfSubjectAverages += subjectAvg;
                    subjectCount++;
                }
                const studentOverallAverage = subjectCount > 0 ? totalAverageOfSubjectAverages / subjectCount : 0;
                allStudentsOverallAverages.push(studentOverallAverage);
            });
            
            if (allStudentsOverallAverages.length > 0) {
                const sumOfAverages = allStudentsOverallAverages.reduce((acc, avg) => acc + avg, 0);
                overallAveragePerformance = sumOfAverages / allStudentsOverallAverages.length;
            }
        }

        // Calculate student distribution by class
        const classDistribution = {};
        if (db.students) {
            db.students.forEach(student => {
                if (student.class) {
                    classDistribution[student.class] = (classDistribution[student.class] || 0) + 1;
                }
            });
        }

        // Calculate subject mastery
        const subjectMastery = {};
        if (db.scores) {
            const subjectScores = {};
            db.scores.forEach(score => {
                if (!subjectScores[score.subject]) {
                    subjectScores[score.subject] = [];
                }
                subjectScores[score.subject].push(parseFloat(score.score));
            });

            for (const subject in subjectScores) {
                const scores = subjectScores[subject];
                const avg = scores.reduce((acc, val) => acc + val, 0) / scores.length;
                subjectMastery[subject] = avg.toFixed(2);
            }
        }

        res.json({
            totalStudents: totalStudents,
            overallAveragePerformance: overallAveragePerformance.toFixed(2),
            classDistribution: classDistribution,
            subjectMastery: subjectMastery
        });
    });
});


// Logout endpoint
app.post('/logout', (req, res) => {
    loggedInUserId = null;
    loggedInUserType = null;
    res.status(200).send('Logged out successfully');
});


// --- STATIC FILE SERVING ---
// Serve static files from the root directory (e.g., index.html, login.html)
app.use(express.static(__dirname));


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
