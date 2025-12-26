document.addEventListener('DOMContentLoaded', () => {
    const objectImage = document.getElementById('object-image');
    const objectName = document.getElementById('object-name');
    const floatBtn = document.getElementById('float-btn');
    const sinkBtn = document.getElementById('sink-btn');
    const message = document.getElementById('message');
    const timerDisplay = document.getElementById('timer');
    const scoreDisplay = document.getElementById('score');
    const playAgainBtn = document.getElementById('play-again-btn');

    // --- Game State Variables ---
    let score = 0;
    let timeLeft = 30; // Timer starts from 30 seconds
    let timer = null; // To hold the setInterval ID
    let currentObject = null;

    // --- Game Objects Data ---
    const objects = [
        { name: 'Rock', image: 'images/rock.jpeg', floats: false },
        { name: 'Wood', image: 'images/wood.jpeg', floats: true },
        { name: 'Key', image: 'images/key.jpeg', floats: false },
        { name: 'Apple', image: 'images/apple.jpeg', floats: true },
        { name: 'Boat', image: 'images/boat.jpeg', floats: true },
        { name: 'Coin', image: 'images/coin.jpeg', floats: false },
        { name: 'Sponge', image: 'images/sponge.jpeg', floats: true },
        { name: 'Metal Ball', image: 'images/metal_ball.jpeg', floats: false },
        { name: 'Ice Cube', image: 'images/ice_cube.jpeg', floats: true },
        { name: 'Stone', image: 'images/stone.jpeg', floats: false },
        { name: 'Plastic Bottle', image: 'images/plastic_bottle.jpeg', floats: true },
        { name: 'Rubber Duck', image: 'images/rubber_duck.jpeg', floats: true },
        // Additional objects with placeholder images
        { name: 'Feather', image: 'images/placeholder.jpeg', floats: true },
        { name: 'Pebble', image: 'images/placeholder.jpeg', floats: false },
        { name: 'Cork', image: 'images/placeholder.jpeg', floats: true },
        { name: 'Marble', image: 'images/placeholder.jpeg', floats: false },
        { name: 'Leaf', image: 'images/placeholder.jpeg', floats: true },
        { name: 'Screw', image: 'images/placeholder.jpeg', floats: false },
    ];

    // --- Helper Functions ---
    function getRandomObject() {
        const randomIndex = Math.floor(Math.random() * objects.length);
        return objects[randomIndex];
    }

    function updateDisplay() {
        if (scoreDisplay) scoreDisplay.textContent = `Score: ${score}`;
        if (timerDisplay) timerDisplay.textContent = `Time: ${timeLeft}s`;
    }

    function resetGameElements() {
        if (floatBtn) floatBtn.style.display = 'inline-block';
        if (sinkBtn) sinkBtn.style.display = 'inline-block';
        if (playAgainBtn) playAgainBtn.style.display = 'none';
        if (message) message.textContent = '';
        if (objectImage) objectImage.src = '';
        if (objectName) objectName.textContent = '';
    }

    // --- Game Logic Functions ---
    function startGame() {
        console.log('startGame called');
        score = 0;
        timeLeft = 30; // Reset timer for new game
        resetGameElements();
        updateDisplay();
        loadNewObject();
        startTimer();
    }

    function startTimer() {
        console.log('startTimer function entered');
        if (timer) clearInterval(timer); // Clear any existing timer

        timer = setInterval(() => {
            timeLeft--;
            updateDisplay();

            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
        console.log('setInterval set');
    }

    function loadNewObject() {
        currentObject = getRandomObject();
        if (objectImage) objectImage.src = currentObject.image;
        if (objectName) objectName.textContent = currentObject.name;
        console.log(`Loading new object: ${currentObject.name}, image: ${currentObject.image}`);
    }

    function checkAnswer(isFloat) {
        if (currentObject === null) return; // Prevent interaction before object loads

        if (isFloat === currentObject.floats) {
            score += 5;
            if (message) {
                message.textContent = 'Correct!';
                message.style.color = 'green';
            }
        } else {
            score -= 5;
            if (message) {
                message.textContent = 'Incorrect!';
                message.style.color = 'red';
            }
        }
        updateDisplay();

        // Briefly show message then load next object
        setTimeout(() => {
            if (message) message.textContent = '';
            loadNewObject();
        }, 1000);
    }

    function endGame() {
        console.log('endGame called');
        if (timer) clearInterval(timer); // Stop the timer

        if (floatBtn) floatBtn.style.display = 'none';
        if (sinkBtn) sinkBtn.style.display = 'none';
        if (objectImage) objectImage.src = '';
        if (objectName) objectName.textContent = '';

        if (message) {
            message.textContent = `Time's up! Your final score: ${score}`;
            message.style.color = 'red';
        }
        if (playAgainBtn) playAgainBtn.style.display = 'inline-block';

        // Save score to backend
        fetch('/save-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ subject: 'physics', score: score }),
        })
        .then(response => response.text())
        .then(data => console.log(data))
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    // --- Event Listeners ---
    if (floatBtn) floatBtn.addEventListener('click', () => checkAnswer(true));
    if (sinkBtn) sinkBtn.addEventListener('click', () => checkAnswer(false));
    if (playAgainBtn) playAgainBtn.addEventListener('click', startGame);

    // --- Initialize Game ---
    startGame();
});
