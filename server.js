const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stem-app'; // Fallback for local development

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// MongoDB Schemas
const UserSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // In a real app, hash passwords!
});

const StudentSchema = new mongoose.Schema({
    class: { type: String, required: true },
    // Inherits uid, fullname, email, password from UserSchema
});

const TeacherSchema = new mongoose.Schema({
    // Inherits uid, fullname, email, password from UserSchema
});

const ScoreSchema = new mongoose.Schema({
    score: { type: Number, required: true },
    subject: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    student_uid: { type: String, required: true, ref: 'Student' }, // Reference to student's UID
});

const Student = mongoose.model('Student', UserSchema.discriminator('Student', StudentSchema));
const Teacher = mongoose.model('Teacher', UserSchema.discriminator('Teacher', TeacherSchema));
const Score = mongoose.model('Score', ScoreSchema);


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// --- API ENDPOINTS ---

// Registration endpoint
app.post('/register', async (req, res) => {
    const { user_type, uid, fullname, email, password } = req.body;

    try {
        let newUser;
        if (user_type === 'student') {
            const { class: studentClass } = req.body;
            newUser = new Student({ uid, fullname, email, password, class: studentClass });
            await newUser.save();

            // Initialize scores for the new student
            const subjects = ["math", "science", "social", "english", "physics", "chemistry", "biology"];
            const initialScores = subjects.map(subject => ({
                score: 0,
                subject: subject,
                student_uid: uid
            }));
            await Score.insertMany(initialScores);

        } else if (user_type === 'teacher') {
            newUser = new Teacher({ uid, fullname, email, password });
            await newUser.save();
        } else {
            return res.status(400).send('Invalid user type');
        }

        console.log('New user registered:', newUser.uid);
        res.redirect('/login.html');
    } catch (error) {
        console.error("Error during registration:", error);
        if (error.code === 11000) { // Duplicate key error
            return res.status(409).send('User with this UID or email already exists.');
        }
        res.status(500).send('Server error');
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { id, password } = req.body;

    try {
        const student = await Student.findOne({ uid: id, password: password });
        if (student) {
            loggedInUserId = student.uid;
            loggedInUserType = 'student';
            console.log('Student logged in:', student.uid);
            return res.redirect('/student_dashboard.html');
        }

        const teacher = await Teacher.findOne({ uid: id, password: password });
        if (teacher) {
            loggedInUserId = teacher.uid;
            loggedInUserType = 'teacher';
            console.log('Teacher logged in:', teacher.uid);
            return res.redirect('/teacher_dashboard.html');
        }

        res.status(401).send('Login Failed: Invalid ID or password.');
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send('Server error');
    }
});

app.post('/save-score', async (req, res) => {
    let { score, subject } = req.body;
    // Only students can save scores
    if (loggedInUserType !== 'student' || !loggedInUserId) {
        return res.status(403).send('Unauthorized: Only logged-in students can save scores.');
    }

    if (subject === 'india' || subject === 'world') {
        subject = 'social';
    }

    try {
        // Remove the initial zero score for this subject if it exists
        // Find existing zero scores for this student and subject
        const existingZeroScores = await Score.find({
            student_uid: loggedInUserId,
            subject: subject,
            score: 0
        });

        // If there are other non-zero scores for this student and subject, remove the zero scores
        const otherScoresExist = await Score.exists({
            student_uid: loggedInUserId,
            subject: subject,
            score: { $ne: 0 }
        });

        if (existingZeroScores.length > 0 && !otherScoresExist) {
            await Score.deleteMany({
                student_uid: loggedInUserId,
                subject: subject,
                score: 0
            });
        }


        const newScore = new Score({ score, subject, student_uid: loggedInUserId });
        await newScore.save();

        console.log('Score saved:', newScore);
        res.status(200).send('Score saved successfully');
    } catch (error) {
        console.error("Error saving score:", error);
        res.status(500).send('Server error');
    }
});

// API endpoint to get average scores for all subjects for the logged-in student
app.get('/api/average-scores', async (req, res) => {
    // Only students can request average scores
    if (loggedInUserType !== 'student' || !loggedInUserId) {
        return res.status(403).send('Unauthorized: Only logged-in students can view average scores.');
    }

    try {
        const studentScores = await Score.find({ student_uid: loggedInUserId });

        if (studentScores.length > 0) {
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
    } catch (error) {
        console.error("Error fetching average scores:", error);
        res.status(500).send('Server error');
    }
});

// API endpoint to get a specific student's details
app.get('/api/student-details', async (req, res) => {
    // Only students can request their own details
    if (loggedInUserType !== 'student' || !loggedInUserId) {
        return res.status(403).send('Unauthorized: Only logged-in students can view their details.');
    }

    try {
        const student = await Student.findOne({ uid: loggedInUserId }).select('-password'); // Exclude password
        if (student) {
            res.json(student);
        } else {
            res.status(404).send('Student not found');
        }
    } catch (error) {
        console.error("Error fetching student details:", error);
        res.status(500).send('Server error');
    }
});

// API endpoint to get a specific teacher's details
app.get('/api/teacher-details', async (req, res) => {
    // Only teachers can request their own details
    if (loggedInUserType !== 'teacher' || !loggedInUserId) {
        return res.status(403).send('Unauthorized: Only logged-in teachers can view their details.');
    }

    try {
        const teacher = await Teacher.findOne({ uid: loggedInUserId }).select('-password'); // Exclude password
        if (teacher) {
            res.json(teacher);
        } else {
            res.status(404).send('Teacher not found');
        }
    } catch (error) {
        console.error("Error fetching teacher details:", error);
        res.status(500).send('Server error');
    }
});

// API endpoint for leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const students = await Student.find({}).select('uid fullname class');
        const scores = await Score.find({});

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
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).send('Server error');
    }
});

// API endpoint for teacher dashboard stats
app.get('/api/teacher-dashboard-stats', async (req, res) => {
    if (loggedInUserType !== 'teacher') {
        return res.status(403).send('Unauthorized: Only teachers can view dashboard stats.');
    }

    try {
        const totalStudents = await Student.countDocuments();
        const students = await Student.find({});
        const scores = await Score.find({});

        let overallAveragePerformance = 0;
        if (students.length > 0) {
            let allStudentsOverallAverages = [];
            students.forEach(student => {
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
        students.forEach(student => {
            if (student.class) {
                classDistribution[student.class] = (classDistribution[student.class] || 0) + 1;
            }
        });

        // Calculate subject mastery
        const subjectMastery = {};
        if (scores.length > 0) {
            const subjectScores = {};
            scores.forEach(score => {
                if (!subjectScores[score.subject]) {
                    subjectScores[score.subject] = [];
                }
                subjectScores[score.subject].push(parseFloat(score.score));
            });

            for (const subject in subjectScores) {
                const subjectAvg = subjectScores[subject].reduce((acc, val) => acc + val, 0) / subjectScores[subject].length;
                subjectMastery[subject] = subjectAvg.toFixed(2);
            }
        }

        res.json({
            totalStudents: totalStudents,
            overallAveragePerformance: overallAveragePerformance.toFixed(2),
            classDistribution: classDistribution,
            subjectMastery: subjectMastery
        });
    } catch (error) {
        console.error("Error fetching teacher dashboard stats:", error);
        res.status(500).send('Server error');
    }
});


// Logout endpoint
app.post('/logout', async (req, res) => {
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
