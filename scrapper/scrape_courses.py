import requests
from bs4 import BeautifulSoup
import json

# Base URL pattern for the pages
BASE_URL = "https://www.hks.harvard.edu/courses?page={}"

def fetch_course_data_from_page(page):
    # Send a GET request to the specific page
    response = requests.get(BASE_URL.format(page))
    
    # Check if the request was successful
    if response.status_code != 200:
        print(f"Failed to fetch data from page {page}: {response.status_code}")
        return []
    
    # Parse the HTML content
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find the table containing course data
    course_table = soup.find("table")  # Adjust this if the table has a specific class or ID
    if not course_table:
        print(f"Course table not found on page {page}!")
        return []
    
    # Extract rows from the table
    courses = []
    rows = course_table.find_all("tr")[1:]  # Skip the header row
    for row in rows:
        columns = row.find_all("td")
        if len(columns) < 3:
            continue
        
        # Extract course details
        course_number = columns[0].text.strip()
        course_title = columns[1].text.strip()
        instructors = [instructor.strip() for instructor in columns[2].text.split("\n") if instructor.strip()]
        
        # Build the course dictionary
        course_data = {
            "course_number": course_number,
            "course_title": course_title,
            "instructors": instructors,
            "semester": "",  # This can be filled if available on the page
            "school": "HKS",  # Assuming all courses are from HKS
            "stem": False,    # Adjust based on additional STEM-related information
            "topic": "",      # Extract if topic information is available
            "cross_register": True,  # Assuming cross-registration is allowed for all
            "stem_group_a": False,   # Adjust based on additional info
            "stem_group_b": False,   # Adjust based on additional info
            "link": f"https://www.hks.harvard.edu/courses/{course_number.replace(' ', '-').lower()}"  # Constructed URL
        }
        
        courses.append(course_data)
    
    return courses

def fetch_all_pages():
    all_courses = []
    for page in range(5):  # Adjust the range if there are more or fewer pages
        print(f"Fetching page {page}...")
        page_data = fetch_course_data_from_page(page)
        all_courses.extend(page_data)
    return all_courses

def save_to_file(data, filename="courses.json"):
    # Save the data to a JSON file
    with open(filename, "w") as file:
        json.dump(data, file, indent=4)
    print(f"Data saved to {filename}")

# Fetch and save the course data
all_course_data = fetch_all_pages()
if all_course_data:
    save_to_file(all_course_data, "courses.json")
