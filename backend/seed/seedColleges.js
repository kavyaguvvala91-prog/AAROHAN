require('dotenv').config();
const connectDB = require('../config/db');
const College = require('../models/College');

const colleges = [
  {
    name: 'IIT Bombay',
    location: 'Mumbai',
    courses: ['Computer Science', 'Mechanical Engineering', 'Electrical Engineering'],
    cutoff_rank: 80,
    fees: 240000,
    avg_package: 2300000,
  },
  {
    name: 'IIT Delhi',
    location: 'Delhi',
    courses: ['Computer Science', 'Civil Engineering', 'Mathematics and Computing'],
    cutoff_rank: 110,
    fees: 230000,
    avg_package: 2200000,
  },
  {
    name: 'NIT Trichy',
    location: 'Tiruchirappalli',
    courses: ['Computer Science', 'Electronics', 'Production Engineering'],
    cutoff_rank: 2200,
    fees: 160000,
    avg_package: 1400000,
  },
  {
    name: 'NIT Surathkal',
    location: 'Mangalore',
    courses: ['Computer Science', 'Information Technology', 'Chemical Engineering'],
    cutoff_rank: 2600,
    fees: 155000,
    avg_package: 1300000,
  },
  {
    name: 'BITS Pilani',
    location: 'Pilani',
    courses: ['Computer Science', 'Electronics', 'Economics'],
    cutoff_rank: 1500,
    fees: 500000,
    avg_package: 1800000,
  },
  {
    name: 'IIIT Hyderabad',
    location: 'Hyderabad',
    courses: ['Computer Science', 'Data Science', 'Artificial Intelligence'],
    cutoff_rank: 900,
    fees: 350000,
    avg_package: 2000000,
  },
  {
    name: 'DTU',
    location: 'Delhi',
    courses: ['Computer Science', 'Software Engineering', 'Mechanical Engineering'],
    cutoff_rank: 5200,
    fees: 190000,
    avg_package: 1200000,
  },
  {
    name: 'VIT Vellore',
    location: 'Vellore',
    courses: ['Computer Science', 'Biotechnology', 'Electronics'],
    cutoff_rank: 9000,
    fees: 198000,
    avg_package: 900000,
  },
  {
    name: 'SRM Institute of Science and Technology',
    location: 'Chennai',
    courses: ['Computer Science', 'Cyber Security', 'Civil Engineering'],
    cutoff_rank: 15000,
    fees: 220000,
    avg_package: 850000,
  },
  {
    name: 'Manipal Institute of Technology',
    location: 'Manipal',
    courses: ['Computer Science', 'Mechatronics', 'Electrical Engineering'],
    cutoff_rank: 12000,
    fees: 320000,
    avg_package: 1000000,
  },
  {
    name: 'PES University',
    location: 'Bengaluru',
    courses: ['Computer Science', 'Electronics', 'Design'],
    cutoff_rank: 8500,
    fees: 450000,
    avg_package: 1100000,
  },
  {
    name: 'RV College of Engineering',
    location: 'Bengaluru',
    courses: ['Computer Science', 'Information Science', 'Electronics'],
    cutoff_rank: 6000,
    fees: 210000,
    avg_package: 1000000,
  },
];

const seedData = async () => {
  try {
    await connectDB();

    await College.deleteMany();
    await College.insertMany(colleges);

    console.log('Seed data inserted successfully');
    process.exit(0);
  } catch (error) {
    console.error(`Error while seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();