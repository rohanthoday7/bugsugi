import 'dotenv/config';
import prisma from './utils/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding database with 30 sample questions...');

  const questions = [
    // Web & CSS
    { text: 'What does CSS stand for?', optionA: 'Computer Style Sheets', optionB: 'Creative Style Sheets', optionC: 'Cascading Style Sheets', optionD: 'Colorful Style Sheets', correctOption: 'C' },
    { text: 'Which HTML tag is used to define an internal style sheet?', optionA: '<css>', optionB: '<script>', optionC: '<style>', optionD: '<link>', correctOption: 'C' },
    { text: 'Which CSS property controls the text size?', optionA: 'text-size', optionB: 'font-size', optionC: 'text-style', optionD: 'font-style', correctOption: 'B' },
    { text: 'In HTML, which attribute specifies an alternate text for an image?', optionA: 'title', optionB: 'src', optionC: 'longdesc', optionD: 'alt', correctOption: 'D' },
    // JavaScript
    { text: 'Which of the following is NOT a JavaScript data type?', optionA: 'Boolean', optionB: 'Float', optionC: 'String', optionD: 'Number', correctOption: 'B' },
    { text: 'What keyword is used to declare a constant in JavaScript?', optionA: 'let', optionB: 'var', optionC: 'const', optionD: 'static', correctOption: 'C' },
    { text: 'Which method removes the last element of a JavaScript array?', optionA: 'pop()', optionB: 'shift()', optionC: 'splice()', optionD: 'slice()', correctOption: 'A' },
    // Networking & HTTP
    { text: 'What does HTTP 404 mean?', optionA: 'Internal Server Error', optionB: 'Not Found', optionC: 'Forbidden', optionD: 'Bad Request', correctOption: 'B' },
    { text: 'Which HTTP method is used to UPDATE an existing resource?', optionA: 'POST', optionB: 'GET', optionC: 'DELETE', optionD: 'PUT', correctOption: 'D' },
    { text: 'What port does HTTPS run on by default?', optionA: '80', optionB: '8080', optionC: '443', optionD: '21', correctOption: 'C' },
    // Databases
    { text: 'Which SQL command is used to retrieve data from a database?', optionA: 'FETCH', optionB: 'SELECT', optionC: 'GET', optionD: 'OPEN', correctOption: 'B' },
    { text: 'What does SQL stand for?', optionA: 'Structured Query Language', optionB: 'Simple Query Language', optionC: 'Standard Query Logic', optionD: 'Sequential Query List', correctOption: 'A' },
    { text: 'Which SQL clause is used to filter results?', optionA: 'ORDER BY', optionB: 'HAVING', optionC: 'WHERE', optionD: 'GROUP BY', correctOption: 'C' },
    // CS Fundamentals
    { text: 'What is the time complexity of binary search?', optionA: 'O(n)', optionB: 'O(n^2)', optionC: 'O(log n)', optionD: 'O(1)', correctOption: 'C' },
    { text: 'Which data structure uses LIFO (Last In First Out)?', optionA: 'Queue', optionB: 'Linked List', optionC: 'Array', optionD: 'Stack', correctOption: 'D' },
    { text: 'Which data structure uses FIFO (First In First Out)?', optionA: 'Stack', optionB: 'Tree', optionC: 'Queue', optionD: 'Graph', correctOption: 'C' },
    { text: 'What is a deadlock in operating systems?', optionA: 'A memory overflow error', optionB: 'Two processes waiting on each other indefinitely', optionC: 'A CPU scheduling algorithm', optionD: 'A program running in background', correctOption: 'B' },
    // Python
    { text: 'Which Python keyword is used to define a function?', optionA: 'function', optionB: 'define', optionC: 'def', optionD: 'fun', correctOption: 'C' },
    { text: 'Which symbol is used for single-line comments in Python?', optionA: '//', optionB: '--', optionC: '#', optionD: '/*', correctOption: 'C' },
    { text: 'What data type is the result of 5 / 2 in Python 3?', optionA: 'int', optionB: 'float', optionC: 'double', optionD: 'decimal', correctOption: 'B' },
    // Security
    { text: 'What does XSS stand for in cybersecurity?', optionA: 'Cross-Site Scripting', optionB: 'Cross-Server Security', optionC: 'Cross-Site Session', optionD: 'Extended Scripting Service', correctOption: 'A' },
    { text: 'Which of the following is a symmetric encryption algorithm?', optionA: 'RSA', optionB: 'DSA', optionC: 'ECC', optionD: 'AES', correctOption: 'D' },
    { text: 'What does a firewall primarily do?', optionA: 'Speeds up internet', optionB: 'Encrypts files', optionC: 'Monitors and filters network traffic', optionD: 'Stores credentials', correctOption: 'C' },
    // OOP
    { text: 'Which OOP principle restricts direct access to an object\'s data?', optionA: 'Inheritance', optionB: 'Polymorphism', optionC: 'Abstraction', optionD: 'Encapsulation', correctOption: 'D' },
    { text: 'What is a constructor in OOP?', optionA: 'A method that destroys an object', optionB: 'A special method that initializes an object', optionC: 'A method that returns a value', optionD: 'A global variable', correctOption: 'B' },
    { text: 'Which of these is NOT an OOP concept?', optionA: 'Inheritance', optionB: 'Compilation', optionC: 'Polymorphism', optionD: 'Encapsulation', correctOption: 'B' },
    // Git
    { text: 'Which Git command creates a new branch and switches to it?', optionA: 'git branch new', optionB: 'git switch --new', optionC: 'git checkout -b', optionD: 'git clone -b', correctOption: 'C' },
    { text: 'What does "git pull" do?', optionA: 'Pushes commits to remote', optionB: 'Deletes a branch', optionC: 'Fetches and merges changes from remote', optionD: 'Creates a new repository', correctOption: 'C' },
    // OS
    { text: 'What is virtual memory?', optionA: 'RAM on the GPU', optionB: 'Memory only in virtual machines', optionC: 'A technique using disk space as extra RAM', optionD: 'Cache inside CPU', correctOption: 'C' },
    { text: 'Which scheduling algorithm gives each process equal time slots in rotation?', optionA: 'FCFS', optionB: 'SJF', optionC: 'Priority Scheduling', optionD: 'Round Robin', correctOption: 'D' },
  ];

  await prisma.teamQuestionSequence.deleteMany();
  await prisma.question.deleteMany();
  console.log('Cleared old questions.');

  for (const q of questions) {
    await prisma.question.create({ data: q });
  }
  console.log(`Inserted ${questions.length} questions into the pool.`);

  // Every team gets ALL 30 questions, just in different random order (anti-copy)
  await prisma.settings.upsert({
    where: { key: 'QUESTIONS_PER_TEAM' },
    update: { value: '30' },
    create: { key: 'QUESTIONS_PER_TEAM', value: '30' }
  });
  console.log('Set QUESTIONS_PER_TEAM = 30 (all questions, shuffled per team)');

  // Ensure sample team exists
  const username = 'testteam';
  const existing = await prisma.team.findUnique({ where: { username } });
  if (!existing) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await prisma.team.create({ data: { username, passwordHash: hashedPassword } });
    console.log('Created testteam / password123');
  } else {
    // Reset so testteam can retake the quiz
    await prisma.teamQuestionSequence.deleteMany({ where: { teamId: existing.id } });
    await prisma.team.update({ where: { id: existing.id }, data: { status: 'NOT_STARTED', startTime: null, endTime: null, score: 0, correctAnswers: 0, wrongAnswers: 0 }});
    console.log('Reset testteam for fresh quiz attempt.');
  }

  console.log('Seeding complete! Each team gets 10 unique random questions from the 30-question pool.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
