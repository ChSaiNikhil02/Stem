document.addEventListener('DOMContentLoaded', () => {
    const questionText = document.getElementById('question-text');
    const mapImage = document.getElementById('map-image');
    const dropTargetsContainer = document.getElementById('drop-targets-container');
    const draggableNamesContainer = document.getElementById('draggable-names-container');
    const hintBtn = document.getElementById('hint-btn');
    const message = document.getElementById('message');
    const timerDisplay = document.getElementById('timer');
    const scoreDisplay = document.getElementById('score');
    const playAgainBtn = document.getElementById('play-again-btn');

    let score = 0;
    let timeLeft = 300;
    let timer;
    let correctPlacements = 0;
    let totalTargets = 0;
    let draggedItem = null;

    const worldMapTargets = [
        { name: 'France', capital: 'Paris', position: { top: '30%', left: '48%', width: '5%', height: '5%' } },
        { name: 'Japan', capital: 'Tokyo', position: { top: '30%', left: '85%', width: '5%', height: '5%' } },
        { name: 'Australia', capital: 'Canberra', position: { top: '70%', left: '80%', width: '8%', height: '8%' } },
        { name: 'Canada', capital: 'Ottawa', position: { top: '20%', left: '15%', width: '10%', height: '10%' } },
        { name: 'Brazil', capital: 'Brasília', position: { top: '55%', left: '30%', width: '10%', height: '10%' } },
        { name: 'Egypt', capital: 'Cairo', position: { top: '40%', left: '55%', width: '5%', height: '5%' } },
        { name: 'Germany', capital: 'Berlin', position: { top: '28%', left: '50%', width: '5%', height: '5%' } },
        { name: 'China', capital: 'Beijing', position: { top: '35%', left: '75%', width: '10%', height: '10%' } },
        { name: 'South Africa', capital: 'Pretoria', position: { top: '70%', left: '55%', width: '8%', height: '8%' } },
        { name: 'Italy', capital: 'Rome', position: { top: '35%', left: '50%', width: '5%', height: '5%' } },
        { name: 'Spain', capital: 'Madrid', position: { top: '35%', left: '45%', width: '5%', height: '5%' } },
        { name: 'Mexico', capital: 'Mexico City', position: { top: '40%', left: '15%', width: '8%', height: '8%' } },
        { name: 'Argentina', capital: 'Buenos Aires', position: { top: '75%', left: '25%', width: '8%', height: '8%' } },
        { name: 'Russia', capital: 'Moscow', position: { top: '20%', left: '65%', width: '15%', height: '10%' } },
        { name: 'United Kingdom', capital: 'London', position: { top: '25%', left: '45%', width: '5%', height: '5%' } },
        { name: 'South Korea', capital: 'Seoul', position: { top: '35%', left: '80%', width: '3%', height: '3%' } },
        { name: 'New Zealand', capital: 'Wellington', position: { top: '80%', left: '90%', width: '5%', height: '5%' } },
        { name: 'Peru', capital: 'Lima', position: { top: '60%', left: '20%', width: '5%', height: '5%' } },
        { name: 'Vietnam', capital: 'Hanoi', position: { top: '45%', left: '78%', width: '5%', height: '5%' } },
        { name: 'Thailand', capital: 'Bangkok', position: { top: '45%', left: '75%', width: '5%', height: '5%' } },
        { name: 'Sweden', capital: 'Stockholm', position: { top: '15%', left: '50%', width: '5%', height: '5%' } },
        { name: 'Switzerland', capital: 'Bern', position: { top: '30%', left: '49%', width: '3%', height: '3%' } },
        { name: 'Portugal', capital: 'Lisbon', position: { top: '38%', left: '43%', width: '3%', height: '3%' } },
        { name: 'Netherlands', capital: 'Amsterdam', position: { top: '25%', left: '48%', width: '3%', height: '3%' } },
        { name: 'Norway', capital: 'Oslo', position: { top: '10%', left: '50%', width: '5%', height: '5%' } },
    ];

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function startGame() {
        score = 0;
        timeLeft = 30;
        correctPlacements = 0;
        scoreDisplay.textContent = `Score: ${score}`;
        message.textContent = '';
        playAgainBtn.style.display = 'none';
        hintBtn.style.display = 'inline-block';
        draggableNamesContainer.innerHTML = '';
        dropTargetsContainer.innerHTML = '';
        loadGame();
        startTimer();
    }

    function startTimer() {
        clearInterval(timer);
        timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `Time: ${timeLeft}s`;
            if (timeLeft <= 0) {
                endGame(true);
            }
        }, 1000);
    }

    function loadGame() {
        questionText.textContent = 'Drag and drop the countries onto the world map.';
        mapImage.src = 'public/images/world map.jpeg';
        draggableNamesContainer.innerHTML = '';
        dropTargetsContainer.innerHTML = '';
        correctPlacements = 0;
        totalTargets = worldMapTargets.length;

        const namesToDrag = shuffleArray(worldMapTargets.map(t => t.name));
        namesToDrag.forEach(name => {
            const draggableItem = document.createElement('div');
            draggableItem.classList.add('draggable-item');
            draggableItem.textContent = name;
            draggableItem.setAttribute('draggable', true);
            draggableItem.dataset.name = name;
            draggableNamesContainer.appendChild(draggableItem);
        });

        worldMapTargets.forEach(target => {
            const dropTarget = document.createElement('div');
            dropTarget.classList.add('drop-target');
            dropTarget.style.top = target.position.top;
            dropTarget.style.left = target.position.left;
            dropTarget.style.width = target.position.width;
            dropTarget.style.height = target.position.height;
            dropTarget.dataset.name = target.name;
            dropTargetsContainer.appendChild(dropTarget);
        });

        addDragDropListeners();
    }

    function addDragDropListeners() {
        const draggables = document.querySelectorAll('.draggable-item');
        const dropTargets = document.querySelectorAll('.drop-target');

        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', (e) => {
                draggedItem = draggable;
                e.dataTransfer.setData('text/plain', draggable.dataset.name);
                draggable.classList.add('dragging');
            });

            draggable.addEventListener('dragend', () => {
                draggable.classList.remove('dragging');
                draggedItem = null;
            });
        });

        dropTargets.forEach(target => {
            target.addEventListener('dragover', (e) => {
                e.preventDefault();
                target.classList.add('highlight');
            });

            target.addEventListener('dragleave', () => {
                target.classList.remove('highlight');
            });

            target.addEventListener('drop', (e) => {
                e.preventDefault();
                target.classList.remove('highlight');
                const droppedName = e.dataTransfer.getData('text/plain');

                if (target.dataset.name === droppedName) {
                    score += 10;
                    message.textContent = `Correct! You placed ${droppedName}.`;
                    message.style.color = 'green';
                    target.classList.add('correct');
                    target.textContent = droppedName;
                    draggedItem.remove();
                    correctPlacements++;
                } else {
                    score = Math.max(0, score - 5);
                    message.textContent = `Wrong! ${droppedName} does not belong there.`;
                    message.style.color = 'red';
                    target.classList.add('incorrect');
                    setTimeout(() => {
                        target.classList.remove('incorrect');
                        message.textContent = '';
                    }, 1000);
                }
                scoreDisplay.textContent = `Score: ${score}`;

                if (correctPlacements === totalTargets) {
                    setTimeout(() => endGame(false, true), 1000);
                }
            });
        });
    }

    function endGame(timeUp = false, gameComplete = false) {
        clearInterval(timer);
        hintBtn.style.display = 'none';
        draggableNamesContainer.innerHTML = '';
        dropTargetsContainer.innerHTML = '';

        if (timeUp) {
            message.textContent = `Time\'s up! Your final score: ${score}`;
            message.style.color = 'red';
            playAgainBtn.style.display = 'inline-block';
        } else if (gameComplete) {
            message.textContent = `Game Completed! Your final score: ${score}`;
            message.style.color = 'blue';
            playAgainBtn.style.display = 'inline-block';
        }

        // Save score to backend
        fetch('/save-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ score, subject: 'world' }),
        })
        .then(response => response.text())
        .then(data => console.log(data))
        .catch(error => console.error('Error saving score:', error));
    }

    hintBtn.addEventListener('click', () => {
        const remainingTargets = Array.from(dropTargetsContainer.children).filter(target => !target.classList.contains('correct'));
        if (remainingTargets.length > 0) {
            const randomTarget = remainingTargets[Math.floor(Math.random() * remainingTargets.length)];
            message.textContent = `Hint: Look for ${randomTarget.dataset.name}.`;
            message.style.color = 'orange';
            randomTarget.classList.add('highlight');
            score = Math.max(0, score - 2);
            scoreDisplay.textContent = `Score: ${score}`;
            setTimeout(() => {
                randomTarget.classList.remove('highlight');
                message.textContent = '';
            }, 2000);
        } else {
            message.textContent = 'No more hints needed!';
            message.style.color = 'gray';
        }
    });

    playAgainBtn.addEventListener('click', startGame);

    startGame();
});
