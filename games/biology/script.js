document.addEventListener('DOMContentLoaded', () => {
    const dropZones = Array.from(document.querySelectorAll('.drop-zone'));
    const statusMessage = document.getElementById('status-message');
    const timerDisplay = document.getElementById('timer');
    const scoreDisplay = document.getElementById('score');
    const debugToggle = document.getElementById('debug-toggle');
    const organContainer = document.querySelector('.organ-container');
    const resetButton = document.getElementById('reset');

    const allOrgans = Array.from(document.querySelectorAll('.organ')); // all organs
    let displayedOrgans = [];
    let correctPlacements = 0;
    const totalOrgans = dropZones.length; // number of correct zones

    let gameTimer = null;
    let startTime = null;

    const MAX_SCORE = 100;
    const MAX_TIME = 60; // seconds to reach zero score

    // ---------- Helpers ----------
    function startGameTimer() {
        if (startTime) return;
        startTime = Date.now();
        gameTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            timerDisplay.textContent = elapsed;
        }, 1000);
    }

    function stopGameTimer() {
        if (gameTimer) {
            clearInterval(gameTimer);
            gameTimer = null;
        }
    }

    function calculateScore() {
        if (!startTime) {
            scoreDisplay.textContent = "0";
            return 0;
        }
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const score = Math.max(0, Math.round(MAX_SCORE - (elapsed / MAX_TIME) * MAX_SCORE));
        scoreDisplay.textContent = score;
        return score;
    }

    async function saveScore(score) {
        try {
            const response = await fetch('/save-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ score: score, subject: 'biology' }),
            });
            if (response.ok) {
                console.log('Score saved successfully');
            } else {
                console.error('Failed to save score');
            }
        } catch (error) {
            console.error('Error saving score:', error);
        }
    }

    function resetUIStatus() {
        statusMessage.textContent = "Drag and drop the organs to their correct place.";
        statusMessage.style.color = "";
        timerDisplay.textContent = "0";
        scoreDisplay.textContent = "0";
    }

    function enableAllOrgans() {
        displayedOrgans.forEach(org => {
            org.setAttribute('draggable', 'true');
            org.style.cursor = 'grab';
            org.classList.remove('dragging');
        });
    }

    function showRandomOrgans(count = 5) {
        // clear container
        organContainer.innerHTML = '';

        // shuffle all organs
        const shuffled = allOrgans.sort(() => 0.5 - Math.random());
        displayedOrgans = shuffled.slice(0, count);

        // append selected organs
        displayedOrgans.forEach(org => {
            organContainer.appendChild(org);
            org.style.display = 'inline-block';
            org.setAttribute('draggable', 'true');
        });
    }

    // ---------- Drop zone handlers ----------
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => e.preventDefault());

        zone.addEventListener('dragenter', (e) => {
            e.preventDefault();
            if (zone.childElementCount === 0) zone.classList.add('hover');
        });

        zone.addEventListener('dragleave', () => zone.classList.remove('hover'));

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('hover');

            if (zone.childElementCount > 0) return;

            const organId = e.dataTransfer.getData('text/plain');
            const organElement = document.getElementById(organId);
            if (!organElement) return;

            if (zone.dataset.organ.toLowerCase() === organId.toLowerCase()) {
                // correct
                zone.appendChild(organElement);
                organElement.setAttribute('draggable', 'false');
                organElement.style.cursor = 'default';
                organElement.classList.remove('dragging');
                zone.classList.add('correct');

                correctPlacements++;
                statusMessage.textContent = `Correct! ${5 - correctPlacements} to go.`;

                if (correctPlacements === 5) {
                    stopGameTimer();
                    const finalScore = calculateScore();
                    saveScore(finalScore);
                    statusMessage.textContent = 'Congratulations! Anatomy complete!';
                    statusMessage.style.color = '#2a9d8f';
                }
            } else {
                statusMessage.textContent = "That doesn't seem right. Try again!";
            }
        });
    });

    // ---------- Drag delegation ----------
    document.addEventListener('dragstart', (e) => {
        const organ = e.target.closest('.organ');
        if (!organ || organ.getAttribute('draggable') !== 'true') return;

        if (!startTime) {
            startGameTimer();
            statusMessage.textContent = 'Timer started! Place the organs.';
        }

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', organ.id);
        setTimeout(() => organ.classList.add('dragging'), 0);
    });

    document.addEventListener('dragend', (e) => {
        const organ = e.target.closest('.organ');
        if (!organ) return;
        organ.classList.remove('dragging');
    });

    // ---------- Debug toggle ----------
    if (debugToggle) {
        debugToggle.addEventListener('change', () => {
            const show = debugToggle.checked;
            dropZones.forEach(z => z.classList.toggle('debug-visible', show));
        });
    }

    // ---------- Reset ----------
    resetButton.addEventListener('click', () => {
        stopGameTimer();
        startTime = null;
        correctPlacements = 0;
        resetUIStatus();
        dropZones.forEach(z => {
            z.innerHTML = '';
            z.classList.remove('correct');
        });
        showRandomOrgans(5);
        enableAllOrgans();
    });

    // ---------- Initial setup ----------
    showRandomOrgans(5);
    enableAllOrgans();
    resetUIStatus();
});