document.addEventListener('DOMContentLoaded', () => {
    const sentenceDisplay = document.getElementById('sentence');
    const answerInput = document.getElementById('answer-input');
    const submitBtn = document.getElementById('submit-btn');
    const hintBtn = document.getElementById('hint-btn');
    const skipBtn = document.getElementById('skip-btn');
    const message = document.getElementById('message');
    const timerDisplay = document.getElementById('timer');
    const scoreDisplay = document.getElementById('score');
    const questionCounterDisplay = document.getElementById('question-counter');
    const playAgainBtn = document.getElementById('play-again-btn');

    let score = 0;
    let timeLeft = 60; // Increased time for more potential questions
    let timer;
    let questionCounter = 0;
    const TOTAL_QUESTIONS = 10;

    let gameQuestions = [];
    let skippedQuestions = [];
    let isAnsweringSkipped = false;
    let currentQuestion = {};

    const allQuestions = [
        // Easy
        { sentence: "She ___ to the store every day.", answer: "goes", hint: "Use the present simple tense for 'she'.", difficulty: "easy" },
        { sentence: "They ___ playing football now.", answer: "are", hint: "Use the present continuous tense for 'they'.", difficulty: "easy" },
        { sentence: "I ___ finished my homework.", answer: "have", hint: "Use the present perfect tense for 'I'.", difficulty: "easy" },
        { sentence: "He ___ a doctor.", answer: "is", hint: "The verb 'to be' for a singular person.", difficulty: "easy" },
        { sentence: "We ___ go to the party tomorrow.", answer: "will", hint: "Use the future simple tense.", difficulty: "easy" },
        { sentence: "The cat sleeps ___ the bed.", answer: "on", hint: "A preposition showing location.", difficulty: "easy" },
        { sentence: "I have ___ apple.", answer: "an", hint: "Use the article for words starting with a vowel sound.", difficulty: "easy" },
        { sentence: "Can you pass me ___ salt?", answer: "the", hint: "Use the definite article for a specific item.", difficulty: "easy" },
        { sentence: "He is ___ than his brother.", answer: "taller", hint: "Use the comparative form of the adjective.", difficulty: "easy" },
        { sentence: "She runs ___.", answer: "quickly", hint: "Use an adverb to describe how she runs.", difficulty: "easy" },
        { sentence: "There ___ many books on the shelf.", answer: "are", hint: "Use the plural form of 'to be' for 'many books'.", difficulty: "easy" },
        { sentence: "What time ___ it?", answer: "is", hint: "The verb 'to be' for asking the time.", difficulty: "easy" },
        { sentence: "The books are ___ the table.", answer: "on", hint: "Preposition of place.", difficulty: "easy" },
        { sentence: "She is ___ a song.", answer: "singing", hint: "Present continuous tense.", difficulty: "easy" },
        { sentence: "I ___ to school by bus.", answer: "go", hint: "Present simple tense for 'I'.", difficulty: "easy" },
        { sentence: "He ___ a brother and a sister.", answer: "has", hint: "Possession in present tense.", difficulty: "easy" },
        { sentence: "My favorite color ___ blue.", answer: "is", hint: "Verb 'to be' for singular subject.", difficulty: "easy" },
        { sentence: "They ___ from Canada.", answer: "are", hint: "Verb 'to be' for plural subject.", difficulty: "easy" },

        // Medium
        { sentence: "The cat ___ on the mat when I came in.", answer: "was sleeping", hint: "Use the past continuous tense for an ongoing action interrupted by another.", difficulty: "medium" },
        { sentence: "If I ___ you, I would not do that.", answer: "were", hint: "Use the subjunctive mood for hypothetical situations.", difficulty: "medium" },
        { sentence: "They had ___ before we arrived.", answer: "eaten", hint: "Use the past participle with 'had' for the past perfect tense.", difficulty: "medium" },
        { sentence: "You ___ study for your exams.", answer: "should", hint: "A modal verb for giving advice.", difficulty: "medium" },
        { sentence: "The book was ___ by a famous author.", answer: "written", hint: "Use the passive voice, requiring the past participle.", difficulty: "medium" },
        { sentence: "She has been working here ___ five years.", answer: "for", hint: "Use 'for' to denote a duration of time.", difficulty: "medium" },
        { sentence: "I am looking forward ___ you.", answer: "to seeing", hint: "This phrase is followed by a gerund.", difficulty: "medium" },
        { sentence: "Neither the students ___ the teacher was happy.", answer: "nor", hint: "The correlative conjunction that pairs with 'neither'.", difficulty: "medium" },
        { sentence: "The news ___ shocking to everyone.", answer: "was", hint: "'News' is an uncountable noun and takes a singular verb.", difficulty: "medium" },
        { sentence: "He is good ___ painting.", answer: "at", hint: "The preposition that follows 'good' to indicate a skill.", difficulty: "medium" },
        { sentence: "This is the book ___ I was telling you about.", answer: "that", hint: "A relative pronoun to introduce a clause.", difficulty: "medium" },
        { sentence: "He has ___ money than I do.", answer: "less", hint: "Use for uncountable nouns like 'money'.", difficulty: "medium" },
        { sentence: "I haven't seen him ___ last year.", answer: "since", hint: "Use 'since' to refer to a specific point in time.", difficulty: "medium" },
        { sentence: "This is much ___ than the other one.", answer: "better", hint: "Comparative form of 'good'.", difficulty: "medium" },
        { sentence: "If it rains, the game ___ be cancelled.", answer: "will", hint: "First conditional structure.", difficulty: "medium" },
        { sentence: "She is known for her ___.", answer: "kindness", hint: "The noun form of 'kind'.", difficulty: "medium" },
        { sentence: "He decided ___ the red car.", answer: "to buy", hint: "The verb 'decide' is followed by an infinitive.", difficulty: "medium" },
        { sentence: "There isn't ___ milk left.", answer: "any", hint: "Used in negative sentences with uncountable nouns.", difficulty: "medium" },

        // Hard
        { sentence: "By the time you arrive, I ___ my work.", answer: "will have finished", hint: "Use the future perfect tense for an action that will be completed before another future action.", difficulty: "hard" },
        { sentence: "He spoke as if he ___ everything.", answer: "knew", hint: "Use the subjunctive mood after 'as if' to indicate something is not true.", difficulty: "hard" },
        { sentence: "___ being tired, he went to the gym.", answer: "Despite", hint: "A preposition used to contrast two things.", difficulty: "hard" },
        { sentence: "The committee ___ not agree on the budget.", answer: "does", hint: "A committee can be treated as a single unit.", difficulty: "hard" },
        { sentence: "I would rather you ___ that.", answer: "didn't do", hint: "The structure 'would rather' is followed by the past tense to talk about preferences.", difficulty: "hard" },
        { sentence: "Not only ___ he miss the bus, but he also forgot his wallet.", answer: "did", hint: "Use inversion after 'Not only' at the beginning of a sentence.", difficulty: "hard" },
        { sentence: "The data ___ that the theory is correct.", answer: "suggest", hint: "'Data' is often used as a plural noun in scientific contexts.", difficulty: "hard" },
        { sentence: "She is one of those people who ___ always late.", answer: "are", hint: "The verb agrees with the plural antecedent 'people', not the singular 'one'.", difficulty: "hard" },
        { sentence: "He was accused ___ cheating on the exam.", answer: "of", hint: "The preposition that follows the verb 'accused'.", difficulty: "hard" },
        { sentence: "It's high time we ___.", answer: "left", hint: "The phrase 'it's high time' is followed by the past simple tense.", difficulty: "hard" },
        { sentence: "The manager, along with the employees, ___ working late.", answer: "is", hint: "The verb agrees with the main subject, 'the manager'.", difficulty: "hard" },
        { sentence: "A number of problems ___ arisen.", answer: "have", hint: "'A number of' is treated as plural.", difficulty: "hard" },
        { sentence: "Had I known, I ___ have come.", answer: "would", hint: "Third conditional, past unreal conditional.", difficulty: "hard" },
        { sentence: "The team, despite the injuries, ___ playing well.", answer: "is", hint: "The subject is 'The team', which is singular.", difficulty: "hard" },
        { sentence: "He is adept ___ solving complex problems.", answer: "at", hint: "The preposition that follows 'adept'.", difficulty: "hard" },
        { sentence: "The number of attendees ___ higher than expected.", answer: "was", hint: "'The number of' is treated as singular.", difficulty: "hard" },
        { sentence: "I insist that he ___ given a fair chance.", answer: "be", hint: "Subjunctive mood after verbs of demand like 'insist'.", difficulty: "hard" },
        { sentence: "Scarcely had I arrived ___ the phone rang.", answer: "when", hint: "'Scarcely' is paired with 'when'.", difficulty: "hard" }
    ];

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function selectGameQuestions() {
        const easyQuestions = shuffleArray(allQuestions.filter(q => q.difficulty === 'easy'));
        const mediumQuestions = shuffleArray(allQuestions.filter(q => q.difficulty === 'medium'));
        const hardQuestions = shuffleArray(allQuestions.filter(q => q.difficulty === 'hard'));

        // 4 easy, 3 medium, 3 hard
        gameQuestions = [
            ...easyQuestions.slice(0, 4),
            ...mediumQuestions.slice(0, 3),
            ...hardQuestions.slice(0, 3)
        ];
    }

    function startGame() {
        score = 0;
        questionCounter = 0;
        timeLeft = 60;
        skippedQuestions = [];
        isAnsweringSkipped = false;

        scoreDisplay.textContent = `Score: 0`;
        message.textContent = '';
        
        playAgainBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
        hintBtn.style.display = 'inline-block';
        skipBtn.style.display = 'inline-block';
        answerInput.value = '';
        answerInput.disabled = false;

        selectGameQuestions();
        loadNewQuestion();
        startTimer();
    }

    function startTimer() {
        clearInterval(timer);
        timerDisplay.textContent = `Time: ${timeLeft}s`;
        timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `Time: ${timeLeft}s`;
            if (timeLeft <= 0) {
                endGame("Time's up!");
            }
        }, 1000);
    }

    function loadNewQuestion() {
        if (!isAnsweringSkipped && questionCounter >= TOTAL_QUESTIONS) {
            if (skippedQuestions.length > 0) {
                isAnsweringSkipped = true;
                questionCounter = 0; // Reset counter for skipped questions
                message.textContent = "Answering skipped questions...";
            } else {
                endGame("You've completed the game!");
                return;
            }
        }

        if (isAnsweringSkipped) {
            if (questionCounter >= skippedQuestions.length) {
                endGame("You've answered all questions!");
                return;
            }
            currentQuestion = skippedQuestions[questionCounter];
            questionCounterDisplay.textContent = `Bonus: ${questionCounter + 1}/${skippedQuestions.length}`;
        } else {
            currentQuestion = gameQuestions[questionCounter];
            questionCounterDisplay.textContent = `Question: ${questionCounter + 1}/${TOTAL_QUESTIONS}`;
        }

        sentenceDisplay.textContent = currentQuestion.sentence;
        answerInput.value = '';
        if (!isAnsweringSkipped) {
             message.textContent = '';
        }
        answerInput.focus();
        questionCounter++;
    }

    function checkAnswer() {
        const userAnswer = answerInput.value.trim().toLowerCase();
        const correctAnswer = currentQuestion.answer.toLowerCase();

        if (userAnswer === correctAnswer) {
            score += 10;
            message.textContent = 'Correct!';
            message.style.color = 'green';
        } else {
            message.textContent = `Incorrect. The correct answer was: ${currentQuestion.answer}`;
            message.style.color = 'red';
        }
        scoreDisplay.textContent = `Score: ${score}`;

        if (isAnsweringSkipped) {
            // Remove the question from skipped array after answering
            skippedQuestions.splice(questionCounter - 1, 1);
            questionCounter--; // Adjust counter because we removed an item
        }

        setTimeout(() => {
            loadNewQuestion();
        }, 1500);
    }

    function skipQuestion() {
        if (isAnsweringSkipped) return; // Don't allow skipping bonus questions

        skippedQuestions.push(currentQuestion);
        message.textContent = "Question skipped!";
        message.style.color = 'gray';

        setTimeout(() => {
            loadNewQuestion();
        }, 1000);
    }

    function endGame(endMessage) {
        clearInterval(timer);
        answerInput.disabled = true;
        submitBtn.style.display = 'none';
        hintBtn.style.display = 'none';
        skipBtn.style.display = 'none';
        playAgainBtn.style.display = 'inline-block';

        message.textContent = `${endMessage} Your final score is ${score}.`;
        message.style.color = 'blue';

        // Send score to backend
        fetch('/save-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ score: score, subject: 'english' }),
        })
        .then(response => response.text())
        .then(data => console.log('Score saved:', data))
        .catch((error) => console.error('Error saving score:', error));
    }

    submitBtn.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
    skipBtn.addEventListener('click', skipQuestion);
    playAgainBtn.addEventListener('click', startGame);

    hintBtn.addEventListener('click', () => {
        if (currentQuestion && currentQuestion.hint) {
            message.textContent = `Hint: ${currentQuestion.hint}`;
            message.style.color = 'orange';
            score = Math.max(0, score - 2); // Deduct 2 points for using a hint
            scoreDisplay.textContent = `Score: ${score}`;
        }
    });

    // Initial game start
    startGame();
});
