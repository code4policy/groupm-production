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

// Function to initialize cross-register toggle for a course
function initializeCrossRegisterToggle(courseData, toggleElementId) {
    const toggle = document.getElementById(toggleElementId);

    // Initialize the checkbox state based on the courseData property
    toggle.checked = courseData.cross_register;

    // Add event listener to update the object when the checkbox is toggled
    toggle.addEventListener("change", (event) => {
        courseData.cross_register = event.target.checked;
        console.log(`Cross-register updated for {courseData.course_number}: {courseData.cross_register}`);
    });
}

// Example usage: Assuming you dynamically create a toggle with ID 'cross-register-toggle'
document.addEventListener("DOMContentLoaded", () => {
    const courseData = {
        course_number: "API-101",
        course_title: "Resources, Incentives, and Choices I: Markets and Market Failures",
        instructors: [
            "Christopher Norio AveryFaculty",
            "Pınar DoğanFaculty",
            "Anne Le BrunFaculty",
            "Juan SaavedraFaculty"
        ],
        semester: "",
        school: "HKS",
        stem: false,
        topic: "",
        cross_register: true,
        stem_group_a: false,
        stem_group_b: false,
        link: "https://www.hks.harvard.edu/courses/api-101"
    };
    initializeCrossRegisterToggle(courseData, "cross-register-toggle");
});


// Helper function to populate instructor dropdown
function populateInstructorDropdown(courses) {
    const instructorSelect = document.getElementById("instructor");
    const uniqueInstructors = new Set();

    courses.forEach(course => {
        course.instructors.forEach(instructor => uniqueInstructors.add(instructor));
    });

    // Clear existing options
    instructorSelect.innerHTML = '<option value="">All Instructors</option>';

    // Add unique instructors as options
    uniqueInstructors.forEach(instructor => {
        const option = document.createElement("option");
        option.value = instructor;
        option.textContent = instructor;
        instructorSelect.appendChild(option);
    });
}

// Function to apply filters (STEM and Cross-register)
function applyFilters(courses) {
    const stemToggle = document.getElementById("stem-toggle").checked;
    const crossRegisterToggle = document.getElementById("cross-register-toggle").checked;

    const filteredCourses = courses.filter(course => {
        const matchesSTEM = !stemToggle || course.stem;
        const matchesCrossRegister = !crossRegisterToggle || course.cross_register;
        return matchesSTEM && matchesCrossRegister;
    });

    renderCourses(filteredCourses);
}

// Function to render courses in the table
function renderCourses(courses) {
    const courseTable = document.getElementById("course-table");
    courseTable.innerHTML = "";

    courses.forEach(course => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><a href="${course.link}" target="_blank">${course.course_number}</a></td>
            <td>${course.course_title}</td>
            <td>${course.instructors.join(", ")}</td>
        `;
        courseTable.appendChild(row);
    });
}

// Main initialization
document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch("data/form_data.json");
    const courses = await response.json();

    // Populate instructor dropdown
    populateInstructorDropdown(courses);

    // Render all courses initially
    renderCourses(courses);

    // Add event listeners for filters
    document.getElementById("stem-toggle").addEventListener("change", () => applyFilters(courses));
    document.getElementById("cross-register-toggle").addEventListener("change", () => applyFilters(courses));
    document.getElementById("search-btn").addEventListener("click", () => applyFilters(courses));
});
