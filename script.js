document.addEventListener('DOMContentLoaded', async () => {
    const courseTable = document.getElementById('course-table');
    const searchInput = document.getElementById('search');
    const searchBtn = document.getElementById('search-btn');
    const semesterDropdown = document.getElementById('semester');
    const instructorDropdown = document.getElementById('instructor');

    if (!courseTable) {
        console.error('Table body with ID "course-table" not found in DOM.');
        return;
    }

    // Fetch courses from JSON file
    const fetchCourses = async () => {
        try {
            const response = await fetch('data/form_data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching courses:', error);
            return [];
        }
    };

    // Fetch instructors from JSON file
    const fetchInstructors = async (courses) => {
        const instructors = new Set();
        courses.forEach(course => {
            course.instructors.forEach(instructor => instructors.add(instructor));
        });
        return Array.from(instructors).sort();
    };

    const renderCourses = (courses) => {
        courseTable.innerHTML = ''; // Clear the table
        if (courses.length === 0) {
            courseTable.innerHTML = '<tr><td colspan="3">No courses found</td></tr>';
            return;
        }
        courses.forEach(course => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${course.course_number}</td>
                <td>${course.course_title}</td>
                <td>${course.instructors.join(', ')}</td>
            `;
            courseTable.appendChild(row);
        });
    };

    const populateInstructors = async (courses) => {
        const instructors = await fetchInstructors(courses);
        instructors.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            instructorDropdown.appendChild(option);
        });
    };

    const filterCourses = (courses) => {
        const searchQuery = searchInput.value.toLowerCase();
        const selectedSemester = semesterDropdown.value;
        const selectedInstructor = instructorDropdown.value;

        return courses.filter(course => {
            const matchesSearch = searchQuery
                ? course.course_number.toLowerCase().includes(searchQuery) ||
                  course.course_title.toLowerCase().includes(searchQuery)
                : true;
            const matchesSemester = selectedSemester
                ? course.semester === selectedSemester
                : true;
            const matchesInstructor = selectedInstructor
                ? course.instructors.includes(selectedInstructor)
                : true;

            return matchesSearch && matchesSemester && matchesInstructor;
        });
    };

    // Fetch and render courses
    const courses = await fetchCourses();
    await populateInstructors(courses); // Populate the instructor dropdown
    renderCourses(courses); // Initial render

    // Add event listeners for filtering
    searchBtn.addEventListener('click', () => {
        const filteredCourses = filterCourses(courses);
        renderCourses(filteredCourses);
    });

    searchInput.addEventListener('input', () => {
        const filteredCourses = filterCourses(courses);
        renderCourses(filteredCourses);
    });

    semesterDropdown.addEventListener('change', () => {
        const filteredCourses = filterCourses(courses);
        renderCourses(filteredCourses);
    });

    instructorDropdown.addEventListener('change', () => {
        const filteredCourses = filterCourses(courses);
        renderCourses(filteredCourses);
    });
});