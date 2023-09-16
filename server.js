const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const pdf = require('html-pdf');

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
    phoneNumber: String,
    state: String,
    address: String,
    email: String,
    parentsName: String,
    alternateNo: String,
    collegeCompany: String,
    dob: String,
    joinDate: String,
    discount: Number,
    paidFees: Number,
    finalFees: Number,
    dueFees: Number,
    paymentId: String,
    dueDate: String,
});


const ticketSchema = new mongoose.Schema({
    ticketID: String,
    studentName: String,
    phoneNumber: String,
    issueDescription: String,
    courseSelection: String,
    importance: String,
    submissionDateTime: { type: Date, default: Date.now }, // Store the date as a Date type
});

const resolvedTicketSchema = new mongoose.Schema({
    ticketID: String,
    studentName: String,
    phoneNumber: String,
    issueDescription: String,
    courseSelection: String,
    importance: String,
    submissionDateTime: Date,
    resolvedDateTime: Date,
    remarks: String, // Add a field for remarks
});

const courseSchema = new mongoose.Schema({
    courseId: String,
    courseName: String,
    instructorName: String,
    mobileNo: String,
    email: String,
    meetingLink: String,
    syllabus: String,
    startDate: Date,
    endDate: Date,
    fees: String,
});
const Event = mongoose.model("StudentTrainee", eventSchema);
const Trainee = mongoose.model("Trainee", traineeSchema);
const Student = mongoose.model("Student", studentSchema);
const Ticket = mongoose.model("Ticket", ticketSchema); 
const ResolvedTicket = mongoose.model('ResolvedTicket', resolvedTicketSchema);
const Course = mongoose.model('Course', courseSchema);

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
                joinDate: student.joinDate,
                phoneNumber: student.phoneNumber,
            }));

            // Retrieve the courses associated with the student
            const courses = students.map((student) => student.courseEnrolled);

            res.status(200).json({ studentDetails, courses });
        } else {
            // If no students are found, send a JSON response indicating "No Results Found"
            res.status(404).json({ message: "No Results Found" });
        }
    } catch (error) {
        console.error("Error searching for student:", error);
        res.status(500).json({ error: "An error occurred" });
    }
});


function generateTicketID() {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `digi01578${day}${minutes}${seconds}`;
}

app.post('/submitTicket', async (req, res) => {
    try {
        const { issueDescription, courseSelection, importance, studentName, phoneNumber } = req.body;

        // Generate a unique ticket ID
        const ticketID = generateTicketID();

        // Get the current date and time
        const submissionDateTime = new Date();

        // Create a new ticket object
        const newTicket = new Ticket({
            ticketID,
            issueDescription,
            courseSelection,
            importance,
            studentName, 
            phoneNumber, 
            submissionDateTime,
        });
        await newTicket.save();
          res.status(200).json({ message: 'Ticket submitted successfully' });
    } catch (error) {
        console.error("Error submitting ticket:", error); // Log any errors
        res.status(500).send("An error occurred");
    }
});

app.get("/getTickets", async (req, res) => {
    try {
        const tickets = await Ticket.find(); // Assuming you want to retrieve all tickets
        res.status(200).json(tickets);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
});

app.get('/getIssuesByPhoneNumber', async (req, res) => {
    try {
        const phoneNumber = req.query.phoneNumber;

        // Query the database to find all issues with the given phone number
        const issues = await Ticket.find({ phoneNumber });

        if (issues.length > 0) {
            // If issues are found, send them as a JSON response
            res.status(200).json(issues);
        } else {
            // If no issues are found, send a JSON response indicating "No Issues Found"
            res.status(404).json({ message: "No Issues Found" });
        }
    } catch (error) {
        console.error("Error fetching issues by phone number:", error);
        res.status(500).json({ error: "An error occurred" });
    }
});

app.post('/revokeTicket', async (req, res) => {
    try {
        const { ticketID } = req.body;

        // Find the ticket by ticketID
        const ticket = await Ticket.findOne({ ticketID });

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Update the ticket with the current time
        ticket.submissionDateTime = new Date();
        await ticket.save();

        res.status(200).json({ message: 'Ticket revoked successfully' });
    } catch (error) {
        console.error('Error revoking ticket:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.post('/moveToResolved', async (req, res) => {
    try {
        const { ticket, remarks } = req.body;

        // Remove the ticket from the current database
        await Ticket.findOneAndDelete({ ticketID: ticket.ticketID });

        // Save the ticket to the resolved database (create a new schema and model for resolved tickets)
        const resolvedTicket = new ResolvedTicket({
            ticketID: ticket.ticketID,
            studentName: ticket.studentName,
            phoneNumber: ticket.phoneNumber,
            issueDescription: ticket.issueDescription,
            courseSelection: ticket.courseSelection,
            importance: 'Blue',
            submissionDateTime: ticket.submissionDateTime,
            resolvedDateTime: new Date(),
            remarks,
        });

        await resolvedTicket.save();

        res.status(200).json({ message: 'Ticket moved to resolved successfully' });
    } catch (error) {
        console.error('Error moving ticket to resolved:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.get("/getResolvedTickets", async (req, res) => {
    try {
        const resolvedTickets = await ResolvedTicket.find();
        res.status(200).json(resolvedTickets);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
});

app.get('/getResolvedIssuesByPhoneNumber', async (req, res) => {
    try {
      const { phoneNumber } = req.query;
      
      // Replace with your database query logic to fetch resolved tickets by phone number
      const resolvedTickets = await ResolvedTicket.find({ phoneNumber });
      
      res.json(resolvedTickets);
    } catch (error) {
      console.error('Error fetching resolved tickets:', error);
      res.status(500).json({ error: 'An error occurred while fetching resolved tickets' });
    }
  });

  // Endpoint to submit a new course
app.post('/submit-course', async (req, res) => {
    try {
        const courseData = req.body;
        const course = new Course(courseData);
        await course.save();
        res.status(201).json({ message: 'Course added successfully' });
    } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to get all courses
app.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        console.error('Error getting courses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to delete a course by ID
app.delete('/delete-course/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        await Course.findByIdAndDelete(courseId);
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to update a course by ID
app.patch('/edit-course/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        const updatedData = req.body;
        await Course.findByIdAndUpdate(courseId, updatedData);
        res.json({ message: 'Course updated successfully' });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get("/getCourses", async (req, res) => {
    try {
        // Fetch courses from the database
        const courses = await Course.find();

        // Return the courses as JSON
        res.status(200).json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
});


app.post("/submitStudent", async (req, res) => {
    try {
        const studentData = req.body;
        // Create a new Student document
        const newStudent = new Student({
            studentName: studentData.studentName,
            courseEnrolled: studentData.courseEnrolled,
            phoneNumber: studentData.phoneNumber,
            state: studentData.state,
            address: studentData.address,
            email: studentData.email,
            parentsName: studentData.parentsName,
            alternateNo: studentData.alternateNo,
            collegeCompany: studentData.collegeCompany,
            dob: studentData.dob,
            joinDate: studentData.joinDate,
            discount: studentData.discount,
            paidFees: studentData.paidFees,
            finalFees: studentData.finalFees,
            dueFees: studentData.finalFees - studentData.paidFees,
            paymentId: studentData.paymentId,
            dueDate: studentData.dueDate,
        });

        // Save the new Student document to the database
        await newStudent.save();

        res.status(200).send("Student data inserted successfully.");
    } catch (error) {
        console.error("Error submitting student data:", error);
        res.status(500).send("An error occurred while submitting student data.");
    }
});
module.exports = Student;

app.get('/getStudentAndCourseData', async (req, res) => {
    try {
        // Fetch student data from the Student model
        const students = await Student.find();

        // Fetch course data from the Course model
        const courses = await Course.find();

        // Return both student and course data as JSON
        res.status(200).json({ students, courses });
    } catch (error) {
        console.error('Error fetching student and course data:', error);
        res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
});

app.get('/getStudentData', async (req, res) => {
    try {
        // Fetch student data from the database (assuming you have a Student model)
        const students = await Student.find({}, '-_id'); // Exclude the _id field

        // Send the student data as JSON
        res.status(200).json(students);
    } catch (error) {
        // Handle errors
        console.error('Error fetching student data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to update student fees
app.post('/updateStudentFees', async (req, res) => {
    try {
        const { name, course, discount, paidFees, finalFees, dueFees, dueDate } = req.body;

        // Find the student by name and course
        const student = await Student.findOne({ studentName: name, courseEnrolled: course });

        if (student) {
            // Update the student's data in the database
            student.discount = discount;
            student.paidFees = paidFees;
            student.finalFees = finalFees;
            student.dueFees = dueFees;
            student.dueDate = dueDate;

            await student.save();

            // Send a success response
            res.status(200).json({ message: 'Student fees updated successfully' });
        } else {
            // Student not found
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        // Handle errors
        console.error('Error updating student fees:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use your email service provider
    auth: {
        user: 'khandelwalg578@gmail.com', // Replace with your email
        pass: 'iodnzocblhqgnkvs', // Replace with your email password
    },
});

// Define a route to send an email
app.post('/sendEmail', (req, res) => {
    const fs = require('fs'); // Include the 'fs' module
    const htmlContent = fs.readFileSync('invoice.html', 'utf8');
    const pdfOptions = { format: 'Letter' }; // Adjust format options as needed
        pdf.create(htmlContent, pdfOptions).toFile('invoice.pdf', (err, res) => {
            if (err) {
                console.error('Error generating PDF:', err);
                res.status(500).json({ error: 'Error generating PDF' });
                return;
            }

    const { to, subject, text } = req.body;

    const mailOptions = {
        from: 'khandelwalg578@gmail.com', // Replace with your email
        to,
        subject,
        text: 'Here is your fees payment invoice - DigiGrowHub!',
        html: htmlContent,
        attachments: [{ filename: 'invoice.pdf', path: 'invoice.pdf' }],
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ error: 'Error sending email' });
        } else {
            console.log('Email sent:', info.response);
            res.status(200).json({ message: 'Email sent successfully' });
        }
    });
});
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
