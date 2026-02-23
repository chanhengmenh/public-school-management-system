export const quizQuestions = {
    "q-1": {
        title: "Algebra Mid-term",
        subject: "Mathematics 10",
        duration: 60, // minutes
        questions: [
            {
                id: 1,
                type: "mcq",
                question: "What is the value of x if 2x + 5 = 15?",
                options: ["x = 5", "x = 10", "x = 7", "x = 3"],
                correctAnswer: 0,
            },
            {
                id: 2,
                type: "mcq",
                question: "Simplify: 3(x + 4) - 2x",
                options: ["x + 12", "5x + 12", "x + 4", "5x + 4"],
                correctAnswer: 0,
            },
            {
                id: 3,
                type: "mcq",
                question: "Which of the following is a quadratic equation?",
                options: ["2x + 3 = 0", "x² + 5x + 6 = 0", "3x = 9", "x/2 = 4"],
                correctAnswer: 1,
            },
            {
                id: 4,
                type: "text",
                question: "Solve for y: 4y - 8 = 12. Write your answer as 'y = [number]'.",
                correctAnswer: "y = 5",
            },
            {
                id: 5,
                type: "mcq",
                question: "What is the slope of the line y = 3x + 2?",
                options: ["2", "3", "1", "0"],
                correctAnswer: 1,
            },
        ],
    },
    "q-2": {
        title: "Newton's Laws Quiz",
        subject: "Physics 10",
        duration: 45,
        questions: [
            {
                id: 1,
                type: "mcq",
                question: "Newton's first law is also known as the law of:",
                options: ["Acceleration", "Inertia", "Action-Reaction", "Gravity"],
                correctAnswer: 1,
            },
            {
                id: 2,
                type: "mcq",
                question: "F = ma represents which of Newton's laws?",
                options: ["First Law", "Second Law", "Third Law", "Law of Gravitation"],
                correctAnswer: 1,
            },
            {
                id: 3,
                type: "text",
                question: "State Newton's Third Law in one sentence.",
                correctAnswer: "",
            },
        ],
    },
};
