const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

const mongoURI = 'mongodb://localhost:27017/testDB';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const eventSchema = new mongoose.Schema({
    courseName: String,
    duration: String,
    startTime: String,
    endTime: String,
    trainerName: String,
    syllabusLink: String,
    meetingLink: String,
    studentInfoLink: String,
});

const Event = mongoose.model("StudentTrainee", eventSchema);

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
            courseName: eventData.courseName,
            duration: eventData.duration,
            startTime: eventData.startTime,
            endTime: eventData.endTime,
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
