// scripts/setup-users.js
const bcrypt = require('bcrypt');

async function hashPasswords() {
  const password = 'password123'; // Demo password
  const saltRounds = 10;
  
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  console.log('Hashed password for demo users:', hashedPassword);
  console.log('\nThe database is initialized with these users:');
  console.log('Students:');
  console.log('  - john.doe@student.edu (STU001) | password123');
  console.log('  - jane.smith@student.edu (STU002) | password123');
  console.log('  - mike.johnson@student.edu (STU003) | password123');
  console.log('\nTeachers:');
  console.log('  - sarah.teacher@school.edu | password123');
  console.log('  - robert.teacher@school.edu | password123');
  
  console.log('\nAll passwords are: password123');
  console.log('Hashed version:', hashedPassword);
}

hashPasswords().catch(console.error);