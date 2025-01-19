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

    // Function to get filtered courses without considering instructor
    function getFilteredCoursesWithoutInstructor() {
        const stemSelected = stemRegister.value;
        const crossSelected = crossRegister.value;
        const topicSelected = topicSelect.value;
        const searchTerm = searchInput.value.toLowerCase();

        return coursesData.filter(course => {
            const stemMatch =
                !stemSelected ||
                (stemSelected === "Group A - Quantitative Analysis" && course.stem_group_a) ||
                (stemSelected === "Group B - Research Methods" && course.stem_group_b) ||
                (stemSelected === "None" && !course.stem_group_a && !course.stem_group_b);
            const crossMatch =
                !crossSelected ||
                (crossSelected === "Yes" && course.cross_register) ||
                (crossSelected === "No" && !course.cross_register);
            const topicMatch =
                !topicSelected || course.topic === topicSelected;
            const searchMatch = !searchTerm ||
                course.course_number.toLowerCase().includes(searchTerm) ||
                course.course_title.toLowerCase().includes(searchTerm) ||
                (course.instructors && course.instructors.some(instructor =>
                    instructor.toLowerCase().includes(searchTerm)
                ));

            return stemMatch && crossMatch && topicMatch && searchMatch;
        });
    }

    // Updated function to populate instructor dropdown based on current filters
    function updateInstructorDropdown() {
        const filteredCourses = getFilteredCoursesWithoutInstructor();
        const currentInstructor = instructorSelect.value;

        // Get all instructors from currently filtered courses
        const instructors = filteredCourses.reduce((acc, course) => {
            if (course.instructors) {
                course.instructors.forEach(instructor => acc.add(instructor));
            }
            return acc;
        }, new Set());

        // Convert to sorted array
        const sortedInstructors = [...instructors].sort();

        // Rebuild dropdown
        instructorSelect.innerHTML = '<option value="">All Instructors</option>';
        sortedInstructors.forEach(instructor => {
            const option = document.createElement('option');
            option.value = instructor;
            option.textContent = instructor;
            // Preserve current selection if instructor still exists in filtered list
            if (instructor === currentInstructor) {
                option.selected = true;
            }
            instructorSelect.appendChild(option);
        });
    }

    // Function to populate topic dropdown
    function populateTopicDropdown(courses) {
        const allTopics = courses.reduce((acc, course) => {
            if (course.topic) {
                acc.add(course.topic);
            }
            return acc;
        }, new Set());
        const sortedTopics = [...allTopics].sort();

        topicSelect.innerHTML = '<option value="">All Topics</option>';
        sortedTopics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic;
            option.textContent = topic;
            topicSelect.appendChild(option);
        });
    }

    // Load and display all courses initially
    async function loadCourses() {
        try {
            const response = await fetch('data/form_data.json');
            const data = await response.json();
            coursesData = data;

            // Initial population of dropdowns
            populateTopicDropdown(coursesData);
            updateInstructorDropdown();

            displayCourses(coursesData);
            console.log("Loaded", coursesData.length, "courses");
        } catch (error) {
            console.error("Error loading courses:", error);
        }
    }

    // Filter courses based on all selections
    function filterCourses() {
        const filteredCourses = getFilteredCoursesWithoutInstructor();
        const instructorSelected = instructorSelect.value;

        // Apply instructor filter separately
        const finalFiltered = filteredCourses.filter(course =>
            !instructorSelected ||
            (course.instructors && course.instructors.includes(instructorSelected))
        );

        displayCourses(finalFiltered);
        updateInstructorDropdown();
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
                <td>${course.course_title}</td>
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
