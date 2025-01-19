// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
    // Get elements
    const stemRegister = document.getElementById("stem-register");
    const crossRegister = document.getElementById("cross-register");
    const courseTable = document.getElementById("course-table");
    const filterButton = document.getElementById("filter-button");
    
    let coursesData = [];

    // Load and display all courses initially
    async function loadCourses() {
        try {
            const response = await fetch('data/form_data.json');
            const data = await response.json();
            coursesData = data;
            displayCourses(coursesData);
            console.log("Loaded", coursesData.length, "courses");
        } catch (error) {
            console.error("Error loading courses:", error);
        }
    }

    // Filter courses based on all selections
    function filterCourses() {
        const stemSelected = stemRegister.value;
        const crossSelected = crossRegister.value;
        console.log("Filtering for STEM:", stemSelected, "Cross Register:", crossSelected);

        const filtered = coursesData.filter(course => {
            // STEM filter
            const stemMatch = 
                !stemSelected || // no STEM filter selected
                (stemSelected === "Group A - Quantitative Analysis" && course.stem_group_a) ||
                (stemSelected === "Group B - Research Methods" && course.stem_group_b) ||
                (stemSelected === "None" && !course.stem_group_a && !course.stem_group_b);

            // Cross registration filter
            const crossMatch = 
                !crossSelected || // no cross registration filter selected
                (crossSelected === "Yes" && course.cross_register) ||
                (crossSelected === "No" && !course.cross_register);

            return stemMatch && crossMatch;
        });

        console.log("Found", filtered.length, "matching courses");
        displayCourses(filtered);
    }

    // Display courses in table
    function displayCourses(courses) {
        courseTable.innerHTML = '';
        
        if (courses.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="3" class="text-center">No courses found matching the selected criteria</td>';
            courseTable.appendChild(row);
            return;
        }

        courses.forEach(course => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${course.course_number}</td>
                <td>${course.link ? `<a href="${course.link}" target="_blank">${course.course_title}</a>` : course.course_title}</td>
                <td>${course.instructors ? course.instructors.join(', ') : 'N/A'}</td>
            `;
            courseTable.appendChild(row);
        });
    }

    // Add event listeners
    stemRegister.addEventListener('change', filterCourses);
    crossRegister.addEventListener('change', filterCourses);
    filterButton.addEventListener('click', (e) => {
        e.preventDefault();
        stemRegister.value = '';
        crossRegister.value = '';
        filterCourses();
    });

    // Load courses when page loads
    loadCourses();
});