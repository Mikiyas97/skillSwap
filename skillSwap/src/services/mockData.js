export const skillCategories = [
  'Technology',
  'Science',
  'Education',
  'Art',
  'Music',
  'Business',
  'Health',
  'Personal',
  'Entertainment',
  'Sport',
  'Society',
  'Other',
];

export const colleges = [
  'Freshman',
  'Computing',
  'Engineering',
  'Natural Science',
  'Social Science',
  'Law',
  'Health',
];

export const departmentsByCollege = {
  Freshman: ['Common Course'],
  Computing: [
    'Software Engineering',
    'Information Systems',
    'Information Technology',
    'Data Science',
    'Computer Science',
  ],
  Engineering: [
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
  ],
  'Natural Science': [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Statistics',
  ],
  'Social Science': [
    'Psychology',
    'Sociology',
    'Political Science',
    'Economics',
  ],
  Law: ['Law'],
  Health: [
    'Medicine',
    'Nursing',
    'Public Health',
    'Pharmacy',
  ],
};

// Flat list for backward compatibility
export const departments = Object.values(departmentsByCollege).flat();

export const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

export const availableTimeSlots = [
  'Monday 8–10am', 'Monday 2–4pm', 'Monday 4–6pm',
  'Tuesday 8–10am', 'Tuesday 2–4pm', 'Tuesday 4–6pm',
  'Wednesday 8–10am', 'Wednesday 2–4pm', 'Wednesday 4–6pm',
  'Thursday 8–10am', 'Thursday 2–4pm', 'Thursday 4–6pm',
  'Friday 8–10am', 'Friday 2–4pm', 'Friday 4–6pm',
  'Saturday 9am–12pm', 'Saturday 2–5pm',
  'Sunday 9am–12pm', 'Sunday 2–5pm',
];
