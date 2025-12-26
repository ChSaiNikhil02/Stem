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

    const indiaMapTargets = [
        { name: 'Maharashtra', capital: 'Mumbai', position: { top: '53%', left: '34.5%', width: '8%', height: '9%' } },
        { name: 'Karnataka', capital: 'Bengaluru', position: { top: '63%', left: '37.5%', width: '5%', height: '11.8%' } },
        { name: 'Rajasthan', capital: 'Jaipur', position: { top: '35%', left: '28%', width: '10%', height: '8%' } },
        { name: 'Uttar Pradesh', capital: 'Lucknow', position: { top: '36%', left: '41.8%', width: '9%', height: '7%' } },
        { name: 'West Bengal', capital: 'Kolkata', position: { top: '47%', left: '56%', width: '5%', height: '6%' } },
        { name: 'Tamil Nadu', capital: 'Chennai', position: { top: '75%', left: '42.5%', width: '5%', height: '9%' } },
        { name: 'Gujarat', capital: 'Gandhinagar', position: { top: '46%', left: '26.5%', width: '8%', height: '8%' } },
        { name: 'Kerala', capital: 'Thiruvananthapuram', position: { top: '75%', left: '38%', width: '4%', height: '9%' } },
        { name: 'Punjab', capital: 'Chandigarh', position: { top: '26%', left: '35.5%', width: '5%', height: '6%' } },
        { name: 'Assam', capital: 'Dispur', position: { top: '37%', left: '62%', width: '6%', height: '5%' } },
        { name: 'Telangana', capital: 'Hyderabad', position: { top: '55.2%', left: '43%', width: '6.5%', height: '6.5%' } },
        { name: 'Bihar', capital: 'Patna', position: { top: '40.7%', left: '51%', width: '8%', height: '5%' } },
        { name: 'Odisha', capital: 'Bhubaneswar', position: { top: '54%', left: '51%', width: '7%', height: '6%' } },
        { name: 'Madhya Pradesh', capital: 'Bhopal', position: { top: '43.5%', left: '37%', width: '10%', height: '9%' } },
        { name: 'Andhra Pradesh', capital: 'Amaravati', position: { top: '62%', left: '43%', width: '8%', height: '8%' } },
        { name: 'Haryana', capital: 'Chandigarh', position: { top: '33%', left: '38.5%', width: '3%', height: '5%' } },
        { name: 'Uttarakhand', capital: 'Dehradun', position: { top: '30.5%', left: '43%', width: '6%', height: '5%' } },
        { name: 'Himachal Pradesh', capital: 'Shimla', position: { top: '25%', left: '41%', width: '5%', height: '5%' } },
        { name: 'Jharkhand', capital: 'Ranchi', position: { top: '46%', left: '51.3%', width: '4.5%', height: '5%' } },
        { name: 'Chhattisgarh', capital: 'Raipur', position: { top: '45%', left: '48%', width: '3.2%', height: '10%' } },
        { name: 'Goa', capital: 'Panaji', position: { top: '63%', left: '34.2%', width: '3%', height: '3%' } },
        { name: 'Tripura', capital: 'Agartala', position: { top: '47%', left: '61.5%', width: '4%', height: '4%' } },
        { name: 'Sikkim', capital: 'Gangtok', position: { top: '37%', left: '57%', width: '4%', height: '3%' } },
        { name: 'Mizoram', capital: 'Aizawl', position: { top: '48.2%', left: '65.7%', width: '4%', height: '5%' } },
        { name: 'Meghalaya', capital: 'Shillong', position: { top: '42.2%', left: '61%', width: '4%', height: '3%' } },
        { name: 'Manipur', capital: 'Imphal', position: { top: '44%', left: '66%', width: '4%', height: '4%' } },
        { name: 'Nagaland', capital: 'Kohima', position: { top: '40%', left: '68.2%', width: '4%', height: '3.5%' } },
        { name: 'Arunachal Pradesh', capital: 'Itanagar', position: { top: '33%', left: '68.4%', width: '6%', height: '6%' } },
        { name: 'Jammu and Kashmir', capital: 'Srinagar', position: { top: '15%', left: '37%', width: '8%', height: '9%' } },
        { name: 'Andaman and Nicobar', position: { top: '75%', left: '65%', width: '2%', height: '10%' } },
        { name: 'Laskhadweep', position: { top: '76%', left: '34%', width: '2%', height: '10%' } },
        { name: 'Srilanka', position: { top: '84.5%', left: '46%', width: '2.8%', height: '6%' } },

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
        timeLeft = 300;
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
        questionText.textContent = 'Drag and drop the Indian states onto the map.';
        mapImage.src = 'public/images/india map.png';
        draggableNamesContainer.innerHTML = '';
        dropTargetsContainer.innerHTML = '';
        correctPlacements = 0;
        totalTargets = indiaMapTargets.length;

        const namesToDrag = shuffleArray(indiaMapTargets.map(t => t.name));
        namesToDrag.forEach(name => {
            const draggableItem = document.createElement('div');
            draggableItem.classList.add('draggable-item');
            draggableItem.textContent = name;
            draggableItem.setAttribute('draggable', true);
            draggableItem.dataset.name = name;
            draggableNamesContainer.appendChild(draggableItem);
        });

        indiaMapTargets.forEach(target => {
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
                    score += 3.125;
                    message.textContent = `Correct! You placed ${droppedName}.`;
                    message.style.color = 'green';
                    target.classList.add('correct');
                    target.textContent = droppedName;
                    draggedItem.remove();
                    correctPlacements++;
                } else {
                    score = Math.max(0, score - 2);
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
            body: JSON.stringify({ score, subject: 'india' }),
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
