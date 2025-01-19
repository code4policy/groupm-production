// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
    // References to DOM elements
    const stemRegister = document.getElementById("stem-register");
    const crossRegister = document.getElementById("cross-register");
    const courseTable = document.getElementById("course-table");
    const searchInput = document.getElementById("search");
    const filterButton = document.getElementById("filter-button");

    let coursesData = [];

    // Convert boolean values to strings
    function getStemGroup(course) {
        if (course.stem_group_a) return "Group A - Quantitative Analysis";
        if (course.stem_group_b) return "Group B - Research Methods";
        return "None";
    }

    function getCrossRegisterStatus(course) {
        return course.cross_register ? "Yes" : "No";
    }

    // Fetch data from the JSON file
    async function fetchData() {
        try {
            const response = await fetch('data/form_data.json');
            if (!response.ok) {
                throw new Error("Failed to load JSON file");
            }
            const data = await response.json();
            
            // Process data and add string properties for filtering
            coursesData = data.map(course => ({
                ...course,
                stem_group: getStemGroup(course),
                cross_register_status: getCrossRegisterStatus(course)
            }));

            console.log('Data loaded:', coursesData.length, 'courses');
            return coursesData;
        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    }

    // Filter courses based on all criteria
    function filterCourses() {
        const selectedStem = stemRegister.value;
        const selectedCrossRegister = crossRegister.value;
        const searchTerm = searchInput.value.toLowerCase();

        console.log('Filtering with:', { selectedStem, selectedCrossRegister, searchTerm });

        const filteredCourses = coursesData.filter(course => {
            // Check STEM filter
            const matchesStem = !selectedStem || 
                              (selectedStem === "None" && course.stem_group === "None") ||
                              course.stem_group === selectedStem;

            // Check Cross Registration filter
            const matchesCrossRegister = !selectedCrossRegister || 
                                       course.cross_register_status === selectedCrossRegister;

            // Check search term
            const matchesSearch = !searchTerm ||
                                course.course_number.toLowerCase().includes(searchTerm) ||
                                course.course_title.toLowerCase().includes(searchTerm);

            return matchesStem && matchesCrossRegister && matchesSearch;
        });

        console.log('Filtered results:', filteredCourses.length, 'courses');
        displayCourses(filteredCourses);
    }

    // Display courses in the table
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
                <td>
                    ${course.link 
                        ? `<a href="${course.link}" target="_blank">${course.course_title}</a>`
                        : course.course_title}
                </td>
                <td>${course.instructors ? course.instructors.join(', ') : 'N/A'}</td>
            `;
            courseTable.appendChild(row);
        });
    }

    // Event listeners
    stemRegister.addEventListener("change", filterCourses);
    crossRegister.addEventListener("change", filterCourses);
    searchInput.addEventListener("input", filterCourses);
    
    filterButton.addEventListener("click", (e) => {
        e.preventDefault();
        stemRegister.value = '';
        crossRegister.value = '';
        searchInput.value = '';
        filterCourses();
    });

    // Initialize
    fetchData().then(() => {
        console.log('Initial load complete');
        filterCourses();
    });
});