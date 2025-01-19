// Load the JSON data from the file
const coursesDataPath = 'data/form_data.json';

// Function to fetch course data
async function fetchCourseData() {
    try {
        const response = await fetch(coursesDataPath);
        if (!response.ok) {
            throw new Error(`Failed to fetch courses data: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching course data:', error);
        return [];
    }
}

// Function to adjust column widths dynamically
function adjustColumnWidths() {
    const table = document.querySelector('.table');
    if (!table) return;

    const headerCells = table.querySelectorAll('thead th');
    const bodyCells = table.querySelectorAll('tbody tr:first-child td');

    headerCells.forEach((th, index) => {
        const correspondingTd = bodyCells[index];
        if (correspondingTd) {
            const width = correspondingTd.offsetWidth + 'px';
            th.style.width = width;
        }
    });
}

// Function to filter and display courses
async function filterCourses() {
    const coursesData = await fetchCourseData();

    // Get filter values
    const stemToggle = document.getElementById('stem-toggle')?.checked || false;
    const crossRegisterToggle = document.getElementById('cross-register-toggle')?.checked || false; // Changed default to false
    const searchQuery = document.getElementById('search')?.value.toLowerCase() || '';
    const selectedTopic = document.getElementById('semester')?.value || '';
    const selectedInstructor = document.getElementById('instructor')?.value || '';
    const selectedStem = document.getElementById('dropdown')?.value || '';

    const tableBody = document.getElementById('course-table');
    if (!tableBody) return;

    // Clear the current table rows
    tableBody.innerHTML = '';

    // Filter courses based on all criteria
    const filteredCourses = coursesData.filter(course => {
        const stemMatch = !stemToggle || course.stem_group_a;
        const crossMatch = !crossRegisterToggle || (crossRegisterToggle && course.cross_register);
        const searchMatch = !searchQuery || 
            course.course_number.toLowerCase().includes(searchQuery) ||
            course.course_title.toLowerCase().includes(searchQuery);
        const topicMatch = !selectedTopic || course.topic === selectedTopic;
        const instructorMatch = !selectedInstructor || 
            (course.instructors &&
             course.instructors.some(instructor => 
                 instructor.toLowerCase().includes(selectedInstructor.toLowerCase())
             ));

        return stemMatch && crossMatch && searchMatch && topicMatch && instructorMatch;
    });

    // Populate the table with filtered courses
    filteredCourses.forEach(course => {
        const row = document.createElement('tr');
        
        const courseNumberCell = document.createElement('td');
        courseNumberCell.textContent = course.course_number;
        row.appendChild(courseNumberCell);

        const courseTitleCell = document.createElement('td');
        courseTitleCell.textContent = course.course_title;
        row.appendChild(courseTitleCell);

        const instructorsCell = document.createElement('td');
        instructorsCell.textContent = course.instructors.join(', ') || 'TBD';
        row.appendChild(instructorsCell);

        tableBody.appendChild(row);
    });

    // Adjust column widths after rendering the table
    adjustColumnWidths();
}

// Add event listeners once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const stemToggle = document.getElementById('stem-toggle');
    const crossRegisterToggle = document.getElementById("cross-register-toggle");
    const searchInput = document.getElementById('search');
    const topicSelect = document.getElementById('semester');
    const instructorSelect = document.getElementById('instructor');
    const searchButton = document.getElementById('search-btn');

    // Add event listeners for all filter changes
    if (stemToggle) stemToggle.addEventListener('change', filterCourses);
    if (searchInput) searchInput.addEventListener('input', filterCourses);
    if (topicSelect) topicSelect.addEventListener('change', filterCourses);
    if (instructorSelect) instructorSelect.addEventListener('change', filterCourses);
    if (searchButton) searchButton.addEventListener('click', filterCourses);
    if (crossRegisterToggle) {
        crossRegisterToggle.addEventListener("change", filterCourses);
    } else {
        console.error("Cross-register toggle not found!");
    }

    // Initial load of courses
    filterCourses();
});

// Function to populate instructor dropdown dynamically
async function populateInstructorDropdown() {
    try {
        // Fetch course data
        const response = await fetch('data/form_data.json');
        if (!response.ok) throw new Error(`Failed to fetch courses data: ${response.status}`);
        const coursesData = await response.json();

        // Collect unique instructors
        const instructorSet = new Set();
        coursesData.forEach(course => {
            course.instructors.forEach(instructor => instructorSet.add(instructor));
        });

        // Get the dropdown element
        const instructorSelect = document.getElementById('instructor');
        if (!instructorSelect) {
            console.error("Instructor dropdown not found!");
            return;
        }

        // Populate dropdown with unique instructors
        instructorSet.forEach(instructor => {
            const option = document.createElement('option');
            option.value = instructor;
            option.textContent = instructor;
            instructorSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error populating instructor dropdown:", error);
    }
}

// Call the function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', populateInstructorDropdown);
