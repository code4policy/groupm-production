// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
    // Get elements
    const stemRegister = document.getElementById("stem-register");
    const crossRegister = document.getElementById("cross-register");
    const instructorSelect = document.getElementById("instructor");
    const topicSelect = document.getElementById("topic");
    const searchInput = document.getElementById("search");
    const courseTable = document.getElementById("course-table");
    const filterButton = document.getElementById("filter-button");

    let coursesData = [];

    // General function to populate a dropdown with unique sorted values
    function populateDropdown(courses, key, dropdown, defaultOptionText) {
        const allValues = courses.reduce((acc, course) => {
            const value = course[key];
            if (Array.isArray(value)) {
                acc.push(...value); // Flatten arrays (for instructors)
            } else if (value) {
                acc.push(value); // Add single values (for topics)
            }
            return acc;
        }, []);
        const uniqueValues = [...new Set(allValues)].sort(); // Unique and sorted values
        dropdown.innerHTML = `<option value="">${defaultOptionText}</option>`;
        uniqueValues.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            dropdown.appendChild(option);
        });
    }

    // Load and display all courses initially
    async function loadCourses() {
        try {
            const response = await fetch('data/form_data.json');
            const data = await response.json();
            coursesData = data;

            // Populate dropdowns
            populateDropdown(coursesData, 'instructors', instructorSelect, 'All Instructors');
            populateDropdown(coursesData, 'topic', topicSelect, 'All Topics');

            displayCourses(coursesData);
            console.log("Loaded", coursesData.length, "courses");
        } catch (error) {
            console.error("Error loading courses:", error);
        }
    }

    // Filter courses based on all selections and search
    function filterCourses() {
        const stemSelected = stemRegister.value;
        const crossSelected = crossRegister.value;
        const instructorSelected = instructorSelect.value;
        const topicSelected = topicSelect.value;
        const searchTerm = searchInput.value.toLowerCase();

        const filtered = coursesData.filter(course => {
            const stemMatch =
                !stemSelected ||
                (stemSelected === "Group A - Quantitative Analysis" && course.stem_group_a) ||
                (stemSelected === "Group B - Research Methods" && course.stem_group_b) ||
                (stemSelected === "None" && !course.stem_group_a && !course.stem_group_b);
            const crossMatch =
                !crossSelected ||
                (crossSelected === "Yes" && course.cross_register) ||
                (crossSelected === "No" && !course.cross_register);
            const instructorMatch =
                !instructorSelected || 
                (course.instructors && course.instructors.includes(instructorSelected));
            const topicMatch =
                !topicSelected || course.topic === topicSelected;
            const searchMatch = !searchTerm ||
                course.course_number.toLowerCase().includes(searchTerm) ||
                course.course_title.toLowerCase().includes(searchTerm) ||
                (course.instructors && course.instructors.some(instructor =>
                    instructor.toLowerCase().includes(searchTerm)
                ));

            return stemMatch && crossMatch && instructorMatch && topicMatch && searchMatch;
        });

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
    topicSelect.addEventListener('change', filterCourses);
    searchInput.addEventListener('input', filterCourses);
    filterButton.addEventListener('click', (e) => {
        e.preventDefault();
        stemRegister.value = '';
        crossRegister.value = '';
        instructorSelect.value = '';
        topicSelect.value = '';
        searchInput.value = '';
        filterCourses();
    });

    // Load courses when page loads
    loadCourses();
});

document.getElementById('menu-toggle').addEventListener('click', () => {
    document.querySelector('.menu').classList.toggle('show');
});
