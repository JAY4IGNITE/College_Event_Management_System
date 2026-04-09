const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();
const { sendEventPublishedEmail } = require('./utils/emailService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve Static Files
app.use(express.static(path.join(__dirname, '../client/dist')));

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/collegeEvents', {
    serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
    }
})
    .then(() => {
        console.log('✅ MongoDB Connected');
        seedAdmin();
        seedProjectMeta();
        // seedEvents(); // Disabled per user request
        // seedOrganizerAndEvents(); // Disabled per user request
    })
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Seed Admin User
async function seedAdmin() {
    try {
        const adminUser = process.env.ADMIN_USERNAME || 'admin';
        const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
        const existingAdmin = await Admin.findOne({ username: adminUser });
        if (!existingAdmin) {
            const newAdmin = new Admin({ username: adminUser, password: adminPass });
            await newAdmin.save();
            console.log('Admin user created successfully');
        }
    } catch (error) {
        console.error('Error seeding admin:', error);
    }
}

// Seed Project Metadata
async function seedProjectMeta() {
    if (mongoose.connection.readyState !== 1) return;
    try {
        const meta = await ProjectMeta.findOne({ key: 'appInfo' });
        if (!meta) {
            const newMeta = new ProjectMeta({
                key: 'appInfo',
                projectName: 'College Event Management System',
                team: 'Team-22',
                version: '1.0.0',
                description: 'A comprehensive platform for managing college events, registrations, and participants.',
                deployedAt: new Date()
            });
            await newMeta.save();
            console.log('Project Metadata initialized');
        }
    } catch (error) {
        console.error('Error seeding project meta:', error);
    }
}

// Seed Sample Events
async function seedEvents() {
    if (mongoose.connection.readyState !== 1) return;
    try {
        const count = await Event.countDocuments();
        if (count === 0) {
            const sampleEvents = [
                {
                    title: 'Tech Symposium 2026',
                    date: '2026-05-15',
                    time: '10:00 AM',
                    location: 'Main Auditorium',
                    description: 'A grand gathering of tech enthusiasts featuring keynote speeches, panel discussions, and project showcases.',
                    category: 'Technical',
                    organizerId: 'ORG001',
                    price: 200,
                    maxParticipants: 500,
                    poster: 'https://images.unsplash.com/photo-1540575861501-7ad060e39fe5?q=80&w=1200',
                    isApproved: true,
                    status: 'upcoming'
                },
                {
                    title: 'Annual Cultural Fest: Tarang',
                    date: '2026-06-10',
                    time: '04:00 PM',
                    location: 'Open Air Theatre',
                    description: 'Celebrate the spirit of creativity with music, dance, and drama performances from across the university.',
                    category: 'Cultural',
                    organizerId: 'ORG002',
                    price: 0,
                    maxParticipants: 1000,
                    poster: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200',
                    isApproved: true,
                    status: 'upcoming'
                },
                {
                    title: 'National Level Hackathon',
                    date: '2026-07-20',
                    time: '09:00 AM',
                    location: 'Innovation Lab',
                    description: 'A 24-hour coding challenge to solve real-world problems. Great prizes and networking opportunities!',
                    category: 'Technical',
                    organizerId: 'ORG001',
                    price: 150,
                    maxParticipants: 100,
                    poster: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200',
                    isApproved: true,
                    status: 'upcoming'
                },
                {
                    title: 'Inter-College Cricket Tournament',
                    date: '2026-08-05',
                    time: '08:00 AM',
                    location: 'University Sports Ground',
                    description: 'Watch the best teams compete for the championship trophy in this thrilling cricket tournament.',
                    category: 'Sports',
                    organizerId: 'ORG003',
                    price: 50,
                    maxParticipants: 16,
                    poster: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200',
                    isApproved: true,
                    status: 'upcoming'
                },
                {
                    title: 'Workshop: Masterclass on AI',
                    date: '2026-04-25',
                    time: '02:00 PM',
                    location: 'Seminar Hall B',
                    description: 'An intensive workshop on Artificial Intelligence and Machine Learning for beginners and intermediates.',
                    category: 'Workshops',
                    organizerId: 'ORG001',
                    price: 100,
                    maxParticipants: 50,
                    poster: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200',
                    isApproved: true,
                    status: 'upcoming'
                }
            ];
            await Event.insertMany(sampleEvents);
            console.log('📅 Sample events seeded successfully');
        }
    } catch (error) {
        console.error('Error seeding events:', error);
    }
}

// Seed Organizer and Events
async function seedOrganizerAndEvents() {
    try {
        const organizerId = 'org1';
        let organizer = await Organizer.findOne({ organizerId });
        if (!organizer) {
            organizer = new Organizer({
                name: 'Jane Doe',
                organizerId: organizerId,
                email: 'janedoe@adityauniversity.in',
                password: 'Password@123',
                securityQuestion: 'pet',
                securityAnswer: 'dog'
            });
            await organizer.save();
            console.log('Organizer seeded successfully');
        }

        const eventsCount = await Event.countDocuments({ organizerId });
        if (eventsCount < 5) {
            const eventsToCreate = [
                { title: 'Tech Innovation Summit 2026', date: '2026-05-15', time: '10:00 AM', location: 'Main Auditorium', category: 'Technology', organizerId, description: 'Annual tech summit showcasing new ideas.', price: 100, maxParticipants: 200 },
                { title: 'Annual Cultural Fest Night', date: '2026-06-20', time: '05:00 PM', location: 'Open Grounds', category: 'Cultural', organizerId, description: 'A night full of music and dance.', price: 50, maxParticipants: 500 },
                { title: 'Advanced AI & ML Workshop', date: '2026-07-10', time: '09:00 AM', location: 'CS Lab 3', category: 'Workshop', organizerId, description: 'Hands-on workshop on AI basics.', price: 0, maxParticipants: 50 },
                { title: 'Inter-College Sports Meet', date: '2026-08-05', time: '08:00 AM', location: 'College Stadium', category: 'Sports', organizerId, description: 'Athletics and team sports tournament.', price: 0, maxParticipants: 300 },
                { title: '24-Hour Code Hackathon', date: '2026-09-12', time: '08:00 AM', location: 'Innovation Hub', category: 'Hackathon', organizerId, description: 'Build solutions in 24 hours.', price: 20, maxParticipants: 100 },
            ];

            for (const ev of eventsToCreate) {
                const existingEvent = await Event.findOne({ title: ev.title });
                if (!existingEvent) {
                    await new Event({ ...ev, status: 'upcoming', isApproved: true }).save();
                }
            }
            console.log('5 Events from organizer seeded successfully');
        }
    } catch (error) {
        console.error('Error seeding organizer and events:', error);
    }
}

// --- Models ---
const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    studentId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    branch: { type: String },
    password: { type: String, required: true },
    securityQuestion: { type: String },
    securityAnswer: { type: String },
    registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }] // Logic kept for backward compatibility
});
const Student = mongoose.model('Student', studentSchema);

const organizerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    organizerId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    securityQuestion: { type: String },
    securityAnswer: { type: String }
});
const Organizer = mongoose.model('Organizer', organizerSchema);

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String },
    location: { type: String },
    description: { type: String },
    category: { type: String },
    organizerId: { type: String },
    price: { type: Number, default: 0 },
    registeredCount: { type: Number, default: 0 },
    // New Fields
    maxParticipants: { type: Number, default: null },
    poster: { type: String }, // URL or Base64
    rules: { type: String },
    deadline: { type: Date },
    status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' },
    isApproved: { type: Boolean, default: false },
    isTeamEvent: { type: Boolean, default: false },
    maxTeamSize: { type: Number, default: 1 }
});
const Event = mongoose.model('Event', eventSchema);

const registrationSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    registrationDate: { type: Date, default: Date.now },
    registrationType: { type: String, enum: ['individual', 'team'], default: 'individual' },
    teamName: { type: String },
    teamMembers: [String], // List of student IDs
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'free'], default: 'pending' },
    paymentId: { type: String },
    paymentAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['registered', 'attended', 'cancelled'], default: 'registered' }
});
const Registration = mongoose.model('Registration', registrationSchema);

const certificateSchema = new mongoose.Schema({
    certificateId: { type: String, required: true, unique: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    eventName: { type: String, required: true },
    issueDate: { type: Date, default: Date.now },
    issuerName: { type: String, required: true }
});
const Certificate = mongoose.model('Certificate', certificateSchema);

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const Admin = mongoose.model('Admin', adminSchema);

const feedbackSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    date: { type: Date, default: Date.now }
});
const Feedback = mongoose.model('Feedback', feedbackSchema);

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String },
    message: { type: String, required: true },
    status: { type: String, default: 'New' },
    date: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

const activityLogSchema = new mongoose.Schema({
    userRole: { type: String },
    userId: { type: String },
    action: { type: String, required: true },
    details: { type: String },
    timestamp: { type: Date, default: Date.now }
});
const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

const projectMetaSchema = new mongoose.Schema({
    key: { type: String, unique: true },
    projectName: String,
    team: String,
    version: String,
    description: String,
    deployedAt: Date
});
const ProjectMeta = mongoose.model('ProjectMeta', projectMetaSchema);

// --- Routes ---

// Root route handled by * catch-all above
// but we can explicitly define it if desired:
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Helper: Validate Password
function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!password || password.length < minLength) return "Password must be at least 8 characters long.";
    if (!hasUpperCase) return "Password must contain at least one uppercase letter (A-Z).";
    if (!hasLowerCase) return "Password must contain at least one lowercase letter (a-z).";
    if (!hasNumbers) return "Password must contain at least one number (0-9).";
    if (!hasSpecialChar) return "Password must contain at least one special character (!@#$%^&*).";

    return null;
}

// Helper: Validate Email Domain
function validateEmailDomain(email) {
    if (!email) return "Email is required.";
    const validDomains = ['@adityauniversity.in', '@gmail.com'];
    const lowerEmail = email.toLowerCase();
    if (!validDomains.some(domain => lowerEmail.endsWith(domain))) {
        return "Only @adityauniversity.in or @gmail.com domains are allowed.";
    }
    return null;
}

// Student Signup
app.post('/api/students/signup', async (req, res) => {
    try {
        const { name, id, email, branch, password, question, answer } = req.body;

        const emailError = validateEmailDomain(email);
        if (emailError) return res.status(400).json({ message: emailError });

        const passwordError = validatePassword(password);
        if (passwordError) return res.status(400).json({ message: passwordError });

        // Check across both students and organizers to prevent collisions
        const existingStudent = await Student.findOne({ $or: [{ studentId: id }, { email }] });
        const existingOrganizer = await Organizer.findOne({ $or: [{ organizerId: id }, { email }] });
        if (existingStudent || existingOrganizer) {
            return res.status(400).json({ message: 'ID or Email is already registered on the platform!' });
        }

        const newStudent = new Student({ name, studentId: id, email, branch, password, securityQuestion: question, securityAnswer: answer });
        await newStudent.save();
        res.status(201).json({ message: 'Student registered successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// Organizer Signup
app.post('/api/organizers/signup', async (req, res) => {
    try {
        const { name, id, email, password, question, answer } = req.body;

        const emailError = validateEmailDomain(email);
        if (emailError) return res.status(400).json({ message: emailError });

        const passwordError = validatePassword(password);
        if (passwordError) return res.status(400).json({ message: passwordError });

        // Check across both students and organizers to prevent collisions
        const existingStudent = await Student.findOne({ $or: [{ studentId: id }, { email }] });
        const existingOrganizer = await Organizer.findOne({ $or: [{ organizerId: id }, { email }] });
        if (existingStudent || existingOrganizer) {
            return res.status(400).json({ message: 'ID or Email is already registered on the platform!' });
        }

        const newOrganizer = new Organizer({ name, organizerId: id, email, password, securityQuestion: question, securityAnswer: answer });
        await newOrganizer.save();
        res.status(201).json({ message: 'Organizer registered successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// Login - Unified (Searches all collections)
app.post('/api/login', async (req, res) => {
    const { userId, password } = req.body; // Role is optional/ignored for search
    
    // Email Validation if input looks like an email
    if (userId && userId.includes('@')) {
        const emailError = validateEmailDomain(userId);
        if (emailError) return res.status(400).json({ message: emailError });
    }

    try {
        // 1. Check Admin
        const admin = await Admin.findOne({ username: userId });
        if (admin && admin.password === password) {
            return res.json({ success: true, role: 'admin', user: { name: 'Admin', id: admin.username } });
        }

        // 2. Check Organizer
        const organizer = await Organizer.findOne({ $or: [{ organizerId: userId }, { email: userId }] });
        if (organizer && organizer.password === password) {
            return res.json({
                success: true,
                role: 'organizer',
                user: {
                    id: organizer.organizerId,
                    name: organizer.name,
                    email: organizer.email,
                    dept: organizer.dept
                }
            });
        }

        // 3. Check Student
        const student = await Student.findOne({ $or: [{ studentId: userId }, { email: userId }] });
        if (student && student.password === password) {
            return res.json({
                success: true,
                role: 'student',
                user: {
                    id: student.studentId,
                    name: student.name,
                    email: student.email,
                    branch: student.branch
                }
            });
        }

        // If none found
        return res.status(401).json({ message: 'Invalid ID/Email or Password' });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// Forgot Password - Find User
app.post('/api/auth/forgot-password/find', async (req, res) => {
    const { role, identifier } = req.body;

    if (identifier && identifier.includes('@')) {
        const emailError = validateEmailDomain(identifier);
        if (emailError) return res.status(400).json({ success: false, message: emailError });
    }

    try {
        let user;
        if (role === 'student') {
            user = await Student.findOne({ $or: [{ studentId: identifier }, { email: identifier }] });
        } else if (role === 'organizer') {
            user = await Organizer.findOne({ $or: [{ organizerId: identifier }, { email: identifier }] });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Return the security question
        res.json({
            success: true,
            userId: user._id, // Send internal ID for next step
            question: user.securityQuestion || 'pet' // Default if missing, though should be there
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Forgot Password - Reset
app.post('/api/auth/forgot-password/reset', async (req, res) => {
    const { role, userId, answer, newPassword } = req.body;
    try {
        let user;
        if (role === 'student') {
            user = await Student.findById(userId);
        } else if (role === 'organizer') {
            user = await Organizer.findById(userId);
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify Answer (Case insensitive check for better UX)
        if (!user.securityAnswer || user.securityAnswer.trim().toLowerCase() !== answer.trim().toLowerCase()) {
            return res.status(400).json({ success: false, message: 'Incorrect security answer' });
        }

        const passwordError = validatePassword(newPassword);
        if (passwordError) return res.status(400).json({ message: passwordError });

        // Update Password
        user.password = newPassword; // Storing plain text as per current implementation (Note: Should hash in production)
        await user.save();

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Real Routes (Will be skipped if Mock Middleware handles response)
app.get('/api/events', async (req, res) => {
    try {
        let query = {};
        if (req.query.approved === 'true') query.isApproved = true;

        const events = await Event.find(query);
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events' });
    }
});

// Create Event (Organizer)
app.post('/api/events', async (req, res) => {
    try {
        const eventData = req.body;

        // Backend Date Validation
        const eventDate = new Date(eventData.date);
        const deadline = new Date(eventData.deadline);
        if (deadline > eventDate) {
            return res.status(400).json({ message: 'Registration deadline cannot be after the event date.' });
        }

        eventData.isApproved = false; // Require admin approval
        eventData.status = 'upcoming';

        const newEvent = new Event(eventData);
        await newEvent.save();
        res.status(201).json({ message: 'Event created and sent for approval', event: newEvent });
    } catch (error) {
        res.status(500).json({ message: 'Error creating event' });
    }
});

// Update Event (Organizer)
app.put('/api/events/:id', async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });

        await logActivity('organizer', updatedEvent.organizerId, 'UPDATE_EVENT', `Updated event: ${updatedEvent.title}`);
        res.json({ message: 'Event updated successfully', event: updatedEvent });
    } catch (error) {
        res.status(500).json({ message: 'Error updating event' });
    }
});

// Event Approval (Admin)
app.put('/api/admin/events/:id/status', async (req, res) => {
    try {
        const { isApproved, status } = req.body;
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const wasApproved = event.isApproved;

        if (isApproved !== undefined) event.isApproved = isApproved;
        if (status) event.status = status;

        await event.save();

        // Phase 1 MVP: Trigger email when event transitions to approved
        if (isApproved === true && !wasApproved) {
            const students = await Student.find({}, 'name email').lean();
            sendEventPublishedEmail(event, students).catch(console.error);
        }

        res.json({ message: 'Event status updated', event });
    } catch (error) {
        res.status(500).json({ message: 'Error updating event status' });
    }
});

// Get All Events (Admin - includes unapproved)
app.get('/api/admin/events/all', async (req, res) => {
    try {
        const events = await Event.find(); // Returns all
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all events' });
    }
});

// Register for Event (Student - Enhanced)
app.post('/api/events/register', async (req, res) => {
    const { studentId, eventId, type, teamName, teamMembers, paymentId } = req.body;
    try {
        const student = await Student.findOne({ studentId });
        const event = await Event.findById(eventId);
        if (!student || !event) return res.status(404).json({ message: 'Student or Event not found' });

        // Check if event is full
        if (event.maxParticipants && event.registeredCount >= event.maxParticipants) {
            return res.status(400).json({ message: 'Event is full' });
        }

        // Check duplicate
        const existingReg = await Registration.findOne({ studentId, eventId });
        if (existingReg) return res.status(400).json({ message: 'Already registered for this event' });

        // Check for time slot conflict
        if (event.date && event.time) {
            // Find all active registrations for this student
            const activeRegistrations = await Registration.find({ 
                studentId, 
                status: { $ne: 'cancelled' } 
            });
            const activeEventIds = activeRegistrations.map(r => r.eventId);
            
            const conflictingEvent = await Event.findOne({
                _id: { $in: activeEventIds },
                date: event.date,
                time: event.time
            });

            if (conflictingEvent) {
                return res.status(400).json({ message: `Time slot conflict: You are already registered for '${conflictingEvent.title}' at this overlapping time slot.` });
            }
        }

        // Create detailed registration
        const newRegistration = new Registration({
            studentId,
            eventId,
            registrationType: type || 'individual',
            teamName,
            teamMembers,
            paymentStatus: event.price > 0 ? 'paid' : 'free', // Assuming verified by frontend payment gateway
            paymentId,
            paymentAmount: event.price
        });
        await newRegistration.save();

        // Update counters and references
        student.registeredEvents.push(eventId);
        event.registeredCount += 1;
        await student.save();
        await event.save();

        await logActivity('student', studentId, 'REGISTER_EVENT', `Registered for ${event.title} (${eventId})`);

        res.json({ message: 'Successfully registered for event!', registrationId: newRegistration._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering for event' });
    }
});

// Get Student Certificates
app.get('/api/students/:id/certificates', async (req, res) => {
    try {
        const certificates = await Certificate.find({ studentId: req.params.id }).populate('eventId', 'date location category poster');
        res.json(certificates);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching certificates' });
    }
});

// Verify Certificate
app.get('/api/certificates/verify/:certId', async (req, res) => {
    try {
        const certificate = await Certificate.findOne({ certificateId: req.params.certId });
        if (!certificate) return res.status(404).json({ valid: false, message: 'Certificate not found' });
        res.json({ valid: true, certificate });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying certificate' });
    }
});

// Get My Registered Events
app.get('/api/students/:id/events', async (req, res) => {
    try {
        const student = await Student.findOne({ studentId: req.params.id }).populate('registeredEvents');
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json(student.registeredEvents);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching registered events' });
    }
});

// Get Event Participants (Organizer)
app.get('/api/organizer/events/:id/participants', async (req, res) => {
    try {
        const eventId = req.params.id;
        const registrations = await Registration.find({ eventId });
        // Enhance with Student names
        const enrichedList = await Promise.all(registrations.map(async (reg) => {
            const student = await Student.findOne({ studentId: reg.studentId }, 'name email branch');
            return {
                ...reg.toObject(),
                studentName: student ? student.name : 'Unknown',
                studentEmail: student ? student.email : 'Unknown',
                studentBranch: student ? student.branch : 'Unknown'
            };
        }));
        res.json(enrichedList);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching participants' });
    }
});

// Update Participant Status (Organizer)
app.put('/api/organizer/participants/:regId', async (req, res) => {
    try {
        const { status } = req.body; // 'attended', 'registered', 'cancelled'
        const reg = await Registration.findByIdAndUpdate(req.params.regId, { status }, { new: true });
        if (!reg) return res.status(404).json({ message: 'Registration not found' });

        if (status === 'attended') {
            const existingCert = await Certificate.findOne({ studentId: reg.studentId, eventId: reg.eventId });
            if (!existingCert) {
                const student = await Student.findOne({ studentId: reg.studentId });
                const event = await Event.findById(reg.eventId);
                if (student && event) {
                    const certId = `CERT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
                    await new Certificate({
                        certificateId: certId,
                        studentId: reg.studentId,
                        studentName: student.name,
                        eventId: event._id,
                        eventName: event.title,
                        issuerName: 'Aditya University Group'
                    }).save();
                }
            }
        }

        res.json({ message: 'Status updated', registration: reg });
    } catch (error) {
        res.status(500).json({ message: 'Error updating status' });
    }
});


// Delete Event (Organizer/Admin)
app.delete('/api/events/:id', async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        // Clean up registrations
        await Registration.deleteMany({ eventId: req.params.id });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event' });
    }
});

// Delete User (Admin)
app.delete('/api/admin/users/:role/:id', async (req, res) => {
    const { role, id } = req.params;
    try {
        if (role === 'student') {
            await Student.findOneAndDelete({ studentId: id });
            await Registration.deleteMany({ studentId: id });
        } else if (role === 'organizer') {
            await Organizer.findOneAndDelete({ organizerId: id });
            // Maybe delete their events? Left for manual cleanup
        } else {
            return res.status(400).json({ message: 'Invalid role' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// Get Users (Admin)
app.get('/api/admin/users', async (req, res) => {
    try {
        const students = await Student.find({}, 'name studentId branch email');
        const organizers = await Organizer.find({}, 'name organizerId email');
        res.json({
            students: students.map(s => ({ name: s.name, id: s.studentId, branch: s.branch, email: s.email, role: 'student' })),
            organizers: organizers.map(o => ({ name: o.name, id: o.organizerId, email: o.email, role: 'organizer' }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Submit Feedback
app.post('/api/feedback', async (req, res) => {
    try {
        const newFeedback = new Feedback(req.body);
        await newFeedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting feedback' });
    }
});

// Submit Contact Inquiry
app.post('/api/contact', async (req, res) => {
    try {
        const newContact = new Contact(req.body);
        await newContact.save();
        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending message' });
    }
});

// Get Project Metadata (About)
app.get('/api/meta', async (req, res) => {
    try {
        const meta = await ProjectMeta.findOne({ key: 'appInfo' });
        res.json(meta);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching metadata' });
    }
});

// Admin: Get All Logs
app.get('/api/admin/logs', async (req, res) => {
    try {
        const logs = await ActivityLog.find().sort({ timestamp: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching logs' });
    }
});

// Admin: Get Dashboard Stats
app.get('/api/admin/stats', async (req, res) => {
    try {
        const studentCount = await Student.countDocuments();
        const organizerCount = await Organizer.countDocuments();
        const eventCount = await Event.countDocuments();
        const pendingEvents = await Event.countDocuments({ isApproved: false });
        res.json({ studentCount, organizerCount, eventCount, pendingEvents });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admin stats' });
    }
});

// Organizer: Get Dashboard Stats
app.get('/api/organizer/:id/stats', async (req, res) => {
    try {
        const organizerId = req.params.id;
        const events = await Event.find({ organizerId });
        const totalEvents = events.length;
        const totalRegistrations = events.reduce((acc, curr) => acc + curr.registeredCount, 0);

        // Fetch recent registrations via Registration model
        const eventIds = events.map(e => e._id);
        const recentRegistrations = await Registration.find({ eventId: { $in: eventIds } })
            .sort({ registrationDate: -1 })
            .limit(5);

        res.json({
            totalEvents,
            totalRegistrations,
            recentActivity: recentRegistrations
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching organizer stats' });
    }
});

// Student: Get Dashboard Stats
app.get('/api/student/:id/stats', async (req, res) => {
    try {
        const studentId = req.params.id;
        const registrations = await Registration.find({ studentId });
        const certificatesCount = await Certificate.countDocuments({ studentId });

        const registeredCount = registrations.length;
        const attendedCount = registrations.filter(r => r.status === 'attended').length;

        res.json({ registeredCount, attendedCount, certificatesCount });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student stats' });
    }
});

// Student: Get Certificates
app.get('/api/students/:id/certificates', async (req, res) => {
    try {
        const studentId = req.params.id;
        const certificates = await Certificate.find({ studentId });
        res.json(certificates);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching certificates' });
    }
});

// Organizer: Get All Issued Certificates
app.get('/api/organizers/:id/certificates', async (req, res) => {
    try {
        const organizerId = req.params.id;
        const events = await Event.find({ organizerId });
        const eventIds = events.map(e => e._id);
        const certificates = await Certificate.find({ eventId: { $in: eventIds } }).sort({ issueDate: -1 });
        res.json(certificates);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching organizer certificates' });
    }
});

// Public: Verify Certificate
app.get('/api/certificates/verify/:certId', async (req, res) => {
    try {
        const certificate = await Certificate.findOne({ certificateId: req.params.certId });
        if (!certificate) return res.status(404).json({ message: 'Certificate not found' });
        res.json(certificate);
    } catch (error) {
        res.status(500).json({ message: 'Error verifying certificate' });
    }
});

// Helper: Middleware to Log Activity
const logActivity = async (role, id, action, details) => {
    try {
        await ActivityLog.create({ userRole: role, userId: id, action, details });
    } catch (e) { console.error('Logging failed', e); }
};

// --- Export Routes ---

// Admin: Export All Students CSV
app.get('/api/admin/export/students', async (req, res) => {
    try {
        const students = await Student.find({}, 'name studentId email branch registeredEvents');

        let csv = 'Name,Student ID,Email,Branch,Registered Events Count\n';
        students.forEach(s => {
            csv += `"${s.name}","${s.studentId}","${s.email}","${s.branch}",${s.registeredEvents.length}\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.attachment('students_report.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Error exporting students' });
    }
});

// Organizer: Export Event Participants CSV
app.get('/api/organizer/export/:eventId', async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const registrations = await Registration.find({ eventId });

        let csv = `Event Report: ${event.title}\n`;
        csv += 'RegistrationID,Student ID,Name,Email,Branch,Type,Team Name,Status,Payment Status\n';

        for (const reg of registrations) {
            const student = await Student.findOne({ studentId: reg.studentId });
            csv += `"${reg._id}","${reg.studentId}","${student ? student.name : 'Unknown'}","${student ? student.email : 'Unknown'}","${student ? student.branch : 'Unknown'}","${reg.registrationType}","${reg.teamName || ''}","${reg.status}","${reg.paymentStatus}"\n`;
        }

        res.header('Content-Type', 'text/csv');
        res.attachment(`participants_${event.title.replace(/ /g, '_')}.csv`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Error exporting participants' });
    }
});


// Handle React Routing, return all requests to React app
app.get('*', (req, res) => {
    // Check if request is for API
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
