const mongoose = require('mongoose');
require('dotenv').config();

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
    maxParticipants: { type: Number, default: null },
    poster: { type: String },
    rules: { type: String },
    deadline: { type: Date },
    status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' },
    isApproved: { type: Boolean, default: false }
});

const Event = mongoose.model('Event', eventSchema);

async function addEvents() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const unapprovedEvents = [
            {
                title: 'Code Combat 2026',
                date: '2026-05-20',
                time: '11:00 AM',
                location: 'Computer Lab 1',
                description: 'Competitive programming challenge for students. Show off your coding skills and win exciting prizes!',
                category: 'Technical',
                organizerId: 'ORG004',
                price: 50,
                maxParticipants: 100,
                poster: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200',
                isApproved: false,
                status: 'upcoming'
            },
            {
                title: 'Robotic Wars',
                date: '2026-06-05',
                time: '10:30 AM',
                location: 'Seminar Hall A',
                description: 'Build your bots and face off in the ultimate robotic combat arena.',
                category: 'Technical',
                organizerId: 'ORG005',
                price: 100,
                maxParticipants: 32,
                poster: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200',
                isApproved: false,
                status: 'upcoming'
            },
            {
                title: 'Rhythm & Blues Night',
                date: '2026-06-12',
                time: '06:00 PM',
                location: 'University Garden',
                description: 'A soulful evening of music and performances under the stars.',
                category: 'Cultural',
                organizerId: 'ORG006',
                price: 0,
                maxParticipants: 300,
                poster: 'https://images.unsplash.com/photo-1514525253361-bee8d4a4d651?q=80&w=1200',
                isApproved: false,
                status: 'upcoming'
            },
            {
                title: 'Lens & Light: Photography Contest',
                date: '2026-07-01',
                time: '09:00 AM',
                location: 'Art Gallery',
                description: 'Capture the beauty of student life and nature in our annual photography competition.',
                category: 'Art',
                organizerId: 'ORG007',
                price: 0,
                maxParticipants: 150,
                poster: 'https://images.unsplash.com/photo-1452781212411-d571f43ddcac?q=80&w=1200',
                isApproved: false,
                status: 'upcoming'
            },
            {
                title: 'Inter-Departmental Football',
                date: '2026-08-10',
                time: '04:00 PM',
                location: 'Sports Ground',
                description: 'The ultimate showdown for the department trophy. Come and cheer for your team!',
                category: 'Sports',
                organizerId: 'ORG008',
                price: 0,
                maxParticipants: 10,
                poster: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200',
                isApproved: false,
                status: 'upcoming'
            }
        ];

        await Event.insertMany(unapprovedEvents);
        console.log('📅 Added 5 unapproved events successfully!');
        
        await mongoose.connection.close();
        console.log('👋 Database connection closed.');
    } catch (error) {
        console.error('❌ Error adding events:', error);
    }
}

addEvents();
