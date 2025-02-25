//Question Class
class Question {
    constructor(title, image, answers, correctAnswer) {
        this.title = title;
        this.image = image;
        this.answers = answers;
        this.correctAnswer = correctAnswer; 
    }

    isCorrectAnswer(selectedAnswer) {
        return selectedAnswer === this.correctAnswer;
    }
}

// Array of Questions  
const questions = [  
    new Question("Which animal is this?", "/image/1.jpg", ["Cat", "Dog", "Rabbit"], "Dog"),
    new Question("Which animal is this?", "/image/2.jpg", ["Cat", "Dog", "Rabbit"], "Cat"),
    new Question("Which animal is this?", "/image/3.jpg", ["Lion", "Tiger", "Cheetah"], "Lion"),
    new Question("Which animal is this?", "/image/4.jpg", ["Elephant", "Giraffe", "Zebra"], "Elephant"),
    new Question("Which animal is this?", "/image/5.jpg", ["Bear", "Dog", "Wolf"], "Dog"),
    new Question("Which animal is this?", "/image/6.jpg", ["Wolf", "Bear", "Dog"], "Bear"),
    new Question("Which animal is this?", "/image/7.jpg", ["Wolf", "Bear", "Dog"], "Wolf"),
    new Question("Which animal is this?", "/image/8.jpg", ["Elephant", "Giraffe", "Zebra"], "Zebra"),
    new Question("Which animal is this?", "/image/9.jpg", ["Elephant", "Giraffe", "Zebra"], "Giraffe"),
    new Question("Which animal is this?", "/image/10.jpg", ["Wolf", "Dog", "Fox"], "Fox")
];

// Variables
let currentQuestion = 0;
let selectedAnswer = null;
let userAnswers = [];
let timeLeft = 60;
let timerInterval;
let studentName = '';

// DOM
const homePage = document.querySelector('.home-page');
const quizPage = document.querySelector('.quiz-page');
const resultPage = document.querySelector('.result-page');
const studentNameInput = document.getElementById('studentName');
const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const timerProgress = document.querySelector('.timer-progress');
const timeDisplay = document.getElementById('timeDisplay');
const questionTitle = document.getElementById('questionTitle');
const questionImage = document.getElementById('questionImage');
const answersContainer = document.getElementById('answersContainer');
const questionNumber = document.getElementById('questionNumber');
const nameErrorMessage = document.getElementById('nameErrorMessage') || document.createElement('div'); // Create if not exists

//error message 
if (!document.getElementById('nameErrorMessage')) {
    nameErrorMessage.id = 'nameErrorMessage';
    nameErrorMessage.className = 'error-message';
    nameErrorMessage.style.color = 'red';
    nameErrorMessage.style.fontSize = '14px';
    nameErrorMessage.style.marginTop = '5px';
    nameErrorMessage.style.display = 'none';
    studentNameInput.parentNode.insertBefore(nameErrorMessage, studentNameInput.nextSibling);
}

// Random Question {Fisher-Yates Shuffle Algorithm}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Validate student name
function validateStudentName(name) {
    // Check for minimum length
    if (name.trim().length < 3) {
        return {
            valid: false,
            message: "Name must be at least 3 characters long"
        };
    }
    
    // Check for maximum length
    if (name.trim().length > 50) {
        return {
            valid: false,
            message: "Name must be less than 50 characters"
        };
    }
    
    // Check for letters only (allowing spaces)
    if (!/^[A-Za-z\s]+$/.test(name.trim())) {
        return {
            valid: false,
            message: "Name must contain only letters"
        };
    }
    
    // Ensure name has at least two parts
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length < 2) {
        return {
            valid: false,
            message: "Please enter your full name (first and last name)"
        };
    }
    
    return {
        valid: true,
        message: ""
    };
}

// Initialize exam function
function initExam() {
    studentName = studentNameInput.value.trim();
    shuffleArray(questions);
    questions.forEach(q => {
        const correctAnswer = q.correctAnswer;
        shuffleArray(q.answers);
    });
    currentQuestion = 0;
    userAnswers = [];
    timeLeft = 60;
    startTimer();
    showQuestion();
}

// Start timer function
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        timerProgress.style.width = `${(timeLeft / 60) * 100}%`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (selectedAnswer !== null) {
                userAnswers.push(selectedAnswer);
            }
            showResults();
        }
    }, 1000);
}

// Show question function
function showQuestion() {
    const question = questions[currentQuestion];
    questionNumber.textContent = currentQuestion + 1;
    questionTitle.textContent = question.title;
    questionImage.src = question.image;
    answersContainer.innerHTML = '';
    question.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.className = 'answer-btn fancy-font';
        button.textContent = answer;
        button.onclick = () => selectAnswer(answer); 
        answersContainer.appendChild(button);
    });

    nextBtn.disabled = true;
    selectedAnswer = null;
}

// Select answer function
function selectAnswer(answer) {
    selectedAnswer = answer;
    document.querySelectorAll('.answer-btn').forEach((btn) => {
        btn.classList.toggle('selected', btn.textContent === answer);
    });
    nextBtn.disabled = false;
}

// Calculate final score
function calculateScore() {
    let score = 0;
    userAnswers.forEach((answer, index) => {
        if (questions[index].isCorrectAnswer(answer)) {
            score++;
        }
    });
    return score;
}

// Show final results
function showResults() {
    clearInterval(timerInterval);
    quizPage.classList.remove('active');
    resultPage.classList.add('active');

    // Calculate the score
    const correctAnswers = calculateScore();
    const totalQuestions = questions.length;
    const percentage = (correctAnswers / totalQuestions) * 100;

    // Update circle progress
    const circle = document.querySelector('.progress');
    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (percentage / 100 * circumference);
    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = `${offset}`;

    // Update texts
    document.querySelector('.result-text').textContent = `${percentage.toFixed(1)}%`;
    document.getElementById('correctAnswers').textContent = correctAnswers;
    document.getElementById('totalQuestions').textContent = totalQuestions;

    // Show student name in results if available
    const studentNameElement = document.getElementById('resultStudentName');
    if (studentNameElement) {
        studentNameElement.textContent = studentName;
    }
}

// Listen for input in name field and validate
studentNameInput.addEventListener('input', () => {
    const name = studentNameInput.value;
    const validation = validateStudentName(name);
    
    if (validation.valid) {
        startBtn.disabled = false;
        nameErrorMessage.style.display = 'none';
    } else {
        startBtn.disabled = true;
        if (name.trim().length > 0) {
            nameErrorMessage.textContent = validation.message;
            nameErrorMessage.style.display = 'block';
        } else {
            nameErrorMessage.style.display = 'none';
        }
    }
});

// Start Quiz button
startBtn.addEventListener('click', () => {
    const name = studentNameInput.value;
    const validation = validateStudentName(name);
    
    if (validation.valid) {
        homePage.classList.remove('active');
        quizPage.classList.add('active');
        initExam();
    } else {
        nameErrorMessage.textContent = validation.message;
        nameErrorMessage.style.display = 'block';
    }
});


//Next button
nextBtn.addEventListener('click', () => {
    userAnswers.push(selectedAnswer);

    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        showQuestion();
    } else {
        showResults();
    }
});