// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
    // Get elements
    const stemRegister = document.getElementById("stem-register");
    const crossRegister = document.getElementById("cross-register");
    const instructorSelect = document.getElementById("instructor");
    const courseTable = document.getElementById("course-table");
    const filterButton = document.getElementById("filter-button");
    
    let coursesData = [];

    // Populate instructor dropdown
    function populateInstructors(courses) {
        // Get all instructor arrays and flatten them
        const allInstructors = courses.reduce((acc, course) => {
            if (course.instructors) {
                acc.push(...course.instructors);
            }
            return acc;
        }, []);

        // Get unique instructors and sort alphabetically
        const uniqueInstructors = [...new Set(allInstructors)].sort();

        // Clear existing options except the first one (All Instructors)
        instructorSelect.innerHTML = '<option value="">All Instructors</option>';

        // Add instructor options
        uniqueInstructors.forEach(instructor => {
            const option = document.createElement('option');
            option.value = instructor;
            option.textContent = instructor;
            instructorSelect.appendChild(option);
        });
    }

    // Load and display all courses initially
    async function loadCourses() {
        try {
            const response = await fetch('data/form_data.json');
            const data = await response.json();
            coursesData = data;
            populateInstructors(coursesData);
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
        const instructorSelected = instructorSelect.value;
        
        console.log("Filtering for STEM:", stemSelected, 
                    "Cross Register:", crossSelected,
                    "Instructor:", instructorSelected);

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

            // Instructor filter
            const instructorMatch = 
                !instructorSelected || // no instructor selected
                (course.instructors && course.instructors.includes(instructorSelected));

            return stemMatch && crossMatch && instructorMatch;
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
    instructorSelect.addEventListener('change', filterCourses);
    filterButton.addEventListener('click', (e) => {
        e.preventDefault();
        stemRegister.value = '';
        crossRegister.value = '';
        instructorSelect.value = '';
        filterCourses();
    });

    // Load courses when page loads
    loadCourses();
});