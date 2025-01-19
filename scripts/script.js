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

// Function to filter and display courses
async function filterCourses() {
    const coursesData = await fetchCourseData();
    
    // Get filter values
    const stemToggle = document.getElementById('stem-toggle')?.checked || false;
    const crossRegisterToggle = document.getElementById('cross-register-toggle')?.checked || false;
    const searchQuery = document.getElementById('search')?.value.toLowerCase() || '';
    const selectedTopic = document.getElementById('semester')?.value || '';
    const selectedInstructor = document.getElementById('instructor')?.value || '';

    const tableBody = document.getElementById('course-table');
    if (!tableBody) return;

    // Clear the current table rows
    tableBody.innerHTML = '';

    // Filter courses based on all criteria
    const filteredCourses = coursesData.filter(course => {
        // STEM and Cross-register filters
        const stemMatch = !stemToggle || course.stem_group_a;
        const crossMatch = !crossRegisterToggle || course.cross_register;
        
        // Search filter (course number or title)
        const searchMatch = !searchQuery || 
            course.course_number.toLowerCase().includes(searchQuery) ||
            course.course_title.toLowerCase().includes(searchQuery);
        
        // Topic filter
        const topicMatch = !selectedTopic || course.topic === selectedTopic;
        
        // Instructor filter
        const instructorMatch = !selectedInstructor || 
            (course.instructors && course.instructors.includes(selectedInstructor));

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
}

// Add event listeners once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Toggle switches
    const stemToggle = document.getElementById('stem-toggle');
    const crossRegisterToggle = document.getElementById('cross-register-toggle');
    
    // Search and filter elements
    const searchInput = document.getElementById('search');
    const topicSelect = document.getElementById('semester');
    const instructorSelect = document.getElementById('instructor');
    const searchButton = document.getElementById('search-btn');

    // Add event listeners for all filter changes
    if (stemToggle) stemToggle.addEventListener('change', filterCourses);
    if (crossRegisterToggle) crossRegisterToggle.addEventListener('change', filterCourses);
    if (searchInput) searchInput.addEventListener('input', filterCourses);
    if (topicSelect) topicSelect.addEventListener('change', filterCourses);
    if (instructorSelect) instructorSelect.addEventListener('change', filterCourses);
    if (searchButton) searchButton.addEventListener('click', filterCourses);

    // Initial load of courses
    filterCourses();
});