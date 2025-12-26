document.addEventListener('DOMContentLoaded', function() {
    const studentRadio = document.getElementById('student');
    const teacherRadio = document.getElementById('teacher');
    const classGroup = document.getElementById('student-class-group');

    function toggleClassField() {
        if (studentRadio.checked) {
            classGroup.style.display = 'block';
        } else {
            classGroup.style.display = 'none';
        }
    }

    // Initial check
    toggleClassField();

    // Add event listeners
    studentRadio.addEventListener('change', toggleClassField);
    teacherRadio.addEventListener('change', toggleClassField);
});