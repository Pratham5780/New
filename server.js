const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

const mongoURI = 'mongodb+srv://khandelwalg578:pQA4raESYbAGecNM@cluster0.y8ouhdk.mongodb.net/?retryWrites=true&w=majority';
const MASTER_PASSWORD = "digi1grow"; 

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const eventSchema = new mongoose.Schema({
    startDate: String,
    endDate: String,
    courseName: String,
    duration: String,
    startTime: String,
    endTime: String,
    Counsellor: String,
    trainerName: String,
    syllabusLink: String,
    meetingLink: String,
    studentInfoLink: String,
});
const traineeSchema = new mongoose.Schema({
    traineeName: String,
    traineeContact: String,
    traineeAlternative: String,
    traineeCity: String,
    traineeSkills: String,
    traineeLogin: String,
    traineePassword: String,
    traineePortfolio: String,
    traineeNotes: String,
});
const studentSchema = new mongoose.Schema({
    studentName: String,
    courseEnrolled: String,
    startDate: String,
    phoneNumber: String,
});

const Event = mongoose.model("StudentTrainee", eventSchema);
const Trainee = mongoose.model("Trainee", traineeSchema);
const Student = mongoose.model("Student", studentSchema);


app.use(express.static("public"));
app.use(express.json());

app.get("/events", async (req, res) => {
    try {
        const events = await Event.find().sort({ startTime: 1 });
        res.status(200).json(events);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
});

app.post("/submit", async (req, res) => {
    try {
        const eventData = req.body;

        const newEvent = new Event({
            startDate: eventData.startDate,
            endDate: eventData.endDate,
            courseName: eventData.courseName,
            duration: eventData.duration,
            startTime: eventData.startTime,
            endTime: eventData.endTime,
            Counsellor: eventData.Counsellor,
            trainerName: eventData.trainerName,
            syllabusLink: eventData.syllabusLink,
            meetingLink: eventData.meetingLink,
            studentInfoLink: eventData.studentInfoLink
        });

        await newEvent.save();

        res.status(200).send("Data inserted successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
});

app.patch('/edit/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        const eventData = req.body;

        const updatedEvent = await Event.findByIdAndUpdate(eventId, eventData, { new: true });
        if (!updatedEvent) {
            return res.status(404).send('Event not found');
        }

        const events = await Event.find().sort({ startTime: 1 });
        res.status(200).json(events);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
});
app.delete('/delete/:id', async (req, res) => {
    try {
        const eventId = req.params.id;

        const deletedEvent = await Event.findByIdAndDelete(eventId);
        if (!deletedEvent) {
            return res.status(404).send('Event not found');
        }

        const events = await Event.find().sort({ startTime: 1 });
        res.status(200).json(events);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
});

app.post("/submitTrainee", async (req, res) => {
    try {
        const {
            traineeName,
            traineeContact,
            traineeAlternative,
            traineeCity,
            traineeSkills,
            traineeLogin,
            traineePassword,
            traineePortfolio,
            traineeNotes,
        } = req.body;

        // Create a new Trainee document
        const newTrainee = new Trainee({
            traineeName,
            traineeContact,
            traineeCity,
            traineeAlternative,
            traineeSkills,
            traineeLogin,
            traineePassword,
            traineePortfolio,
            traineeNotes,
        });

        // Save the new Trainee document to the database
        await newTrainee.save();

        res.status(200).send("Trainee data submitted successfully.");
    } catch (error) {
        console.error("Error submitting trainee data:", error);
        res.status(500).send("An error occurred while submitting trainee data.");
    }
});

app.get("/trainees", async (req, res) => {
    try {
        const trainees = await Trainee.find();
        res.status(200).json(trainees);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
});

app.post("/submitStudent", async (req, res) => {
    try {
        const studentData = req.body;

        if (!studentData.studentName || !studentData.courseEnrolled || !studentData.startDate || !studentData.phoneNumber) {
            // Check if any required field is missing
            return res.status(400).send("Missing required fields.");
        }

        const newStudent = new Student({
            studentName: studentData.studentName,
            courseEnrolled: studentData.courseEnrolled,
            startDate: studentData.startDate,
            phoneNumber: studentData.phoneNumber,
        });

        await newStudent.save();

        res.status(200).send("Student data inserted successfully.");
    } catch (error) {
        console.error("Error submitting student data:", error);
        res.status(500).send("An error occurred while submitting student data.");
    }
});
app.get("/students", async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
});

app.post("/password", (req, res) => {
    const { password } = req.body;

    if (password === MASTER_PASSWORD) {
        res.status(200).json({ valid: true });
    } else {
        res.status(200).json({ valid: false });
    }
});

app.get("/searchStudentByPhoneNumber", async (req, res) => {
    try {
        const phoneNumber = req.query.phoneNumber;

        // Query the database to find all students with the given phone number
        const students = await Student.find({ phoneNumber });

        if (students.length > 0) {
            // If students are found, create an array to store their details
            const studentDetails = students.map((student) => ({
                studentName: student.studentName,
                courseEnrolled: student.courseEnrolled,
                startDate: student.startDate,
                phoneNumber: student.phoneNumber,
            }));

            res.status(200).json(studentDetails);
        } else {
            // If no students are found, send a JSON response indicating "No Results Found"
            res.status(404).json({ message: "No Results Found" });
        }
    } catch (error) {
        console.error("Error searching for student:", error);
        res.status(500).json({ error: "An error occurred" });
    }
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
