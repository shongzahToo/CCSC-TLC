//#region Global Resources
// Store selected time slots
let selectedTimes = {};
// Array of weekdays
var days = ["MON", "TUE", "WED", "THU", "FRI"];

// Create table body element
var body = document.createElement("tbody");

// Track mouse state for drag selection
let isMouseDown = false;

// Get reference to calendar table
var table = document.getElementById("calendar")

// Add mouse event listeners for drag selection functionality
table.addEventListener("mousedown", (event) => {
    if (event.button == 0) { // Left click only
        if (event.target.tagName === "TD" && event.target.id) {
            isMouseDown = true;
            toggleSlot(event.target);
        }
        event.preventDefault();
    }
});

// Handle dragging across cells
table.addEventListener("mouseover", (event) => {
    if (isMouseDown && event.target.tagName === "TD" && event.target.id) {
        toggleSlot(event.target);
    }
});

// Reset mouse state when releasing button
table.addEventListener("mouseup", (event) => {
    if (event.button == 0) {
        isMouseDown = false;
    }
});

// Add clear button functionality
let clear = document.getElementById("clear");
clear.addEventListener("click", clearTableData);

// Update cells when selection changes
document.getElementById("floatingSelect").addEventListener("change", () => {
    updateCells();
});

// Submit data when button clicked
document.getElementById("submit").addEventListener("click", ()=>{
    pushData();
});
//#endregion

// Initialize calendar on page load
window.onload = async function () {
    try {
        // Fetch tutor data from API
        const response = await fetch("http://70.57.81.35:5000/tutors");
        apiData = await response.json();
        data = []
        // Convert API data to Tutor objects
        apiData.forEach(
            tutor => {
                data.push(new Tutor(tutor))
            }
        )
        // Initialize dropdown and calendar cells
        populateFirstDropdown();
        updateCells();
    } catch (error) {
        // Handle errors by showing message and removing containers
        document.getElementById("error").innerText =
            "An error occured, please try again later";
        Array.from([
            "selectBoxContainer",
            "calendarContainer",
            "settingsContainer",
        ]).forEach((id) => {
            document.getElementById(id).remove();
        });
        console.error("Failed to fetch schedule data:", error);
    }
};

// Create initial table structure
CreateTable();

// Class to represent time ranges
class Range {
    constructor(Start, End) {
        this.Start = Start;
        this.End = End;
    }
}

// Class for managing tutor data and schedules
class Tutor {
    constructor(tutor) {
        this.id = tutor.student_id
        this.first_name = tutor.first_name
        this.last_name = tutor.last_name
        this.schedule = this.ScheduleConvert(tutor.schedule)
    }
    
    // Convert schedule format from ranges to boolean arrays
    ScheduleConvert = function(input) {
        let schedule = {}
        for(let i = 0; i < days.length; i++) {
            if(days[i] in input) {
                schedule[days[i]] = this.RangeToArray(input[days[i]])
            }
        }
        return schedule
    }

    // Convert time ranges to 24-hour boolean array
    RangeToArray = function(ranges) {
        let day = []
        for (let i = 0; i < 24; i++) {
            day[i] = false
        }
        for (let i = 0; i < ranges.length; i++) {
            for (let j = ranges[i].Start; j < ranges[i].End; j++) {
                day[j] = true
            }
        }
        return day
    }

    // Convert boolean array back to time ranges
    ArrayToRange = function(array) {
        let ranges = []
        let tracking = false
        let start = 0
        let end = 0
        for(let i = 0; i < 24; i++) {
            if(array[i] == true && tracking == false) {
                start = i
                tracking = true
            }
            if (array[i] == false && tracking == true) {
                end = i
                tracking = false
                ranges.push({Start: start, End: end})
            }
            if (i == 23 && array[i] == true && tracking == true) {
                end = 24
                ranges.push({Start: start, End: end})
            }
        }
        return ranges
    }
    
    // Format tutor data for API submission
    Output = function() {
        let output = {
            student_id: this.id,
            first_name: this.first_name,
            last_name: this.last_name,
            schedule: {}
        }

        for (let i = 0; i < days.length; i++) {
            if(days[i] in this.schedule) {
                output.schedule[days[i]] = this.ArrayToRange(this.schedule[days[i]])
            }
        }
        return output
    }
}

// Clear all calendar data
function clearTableData() {
    clearTableDisplay();
    UpdateApiData()
}

// Submit updated schedule to API
async function pushData() {
    try {
        let url = "http://70.57.81.35:5000/tutors"

        await fetch(
            url,
            {
                method: "POST",
                body: JSON.stringify(apiData),
                headers: {"Content-type": "application/json; charset=UTF-8"}
            }
        )
        
    } catch {
        console.error("Failed to fetch schedule data:", error);
    }
}

// Clear visual calendar display
function clearTableDisplay() {
    document.getElementById("calendar").innerHTML = "";
    CreateTable();
}

// Update visual state of calendar cells
function updateCells() {
    var tbody = document.getElementById("calendar").children[1];
    // Get all time slot cells
    var dayCells = [];
    for (let tr = 0; tr < tbody.children.length; tr++) {
        for (let td = 0; td < tbody.children[tr].children.length; td++) {
            if (td != 0) {
                dayCells.push(tbody.children[tr].children[td]);
            }
        }
    }
    let person = document.getElementById("floatingSelect").value;
    // Get selected tutor's schedule
    var specificSchedule = [];
    for (let i = 0; i < apiData.length; i++) {
        if (apiData[i].student_id == person) {
            specificSchedule = apiData[i].schedule;
        }
    }
    // Update each cell's selected state
    dayCells.forEach((cell) => {
        if (!specificSchedule) {
            cell.classList.toggle("selected", false);
        } else {
            var isSelected = false;
            // Parse day and time from cell ID
            var dayOfWeek = cell.id.slice(1);
            var timeSlotId = cell.id.substring(0, 1);
            if (cell.id.length == 5) {
                timeSlotId = cell.id.substring(0, 2);
                dayOfWeek = cell.id.slice(2);
            }
            var timeSlots = specificSchedule[dayOfWeek];
            if (timeSlots) {
                timeSlots.forEach((range) => {
                    if (range.Start <= timeSlotId && timeSlotId <= range.End) {
                        isSelected = true;
                    }
                });
            }
            cell.classList.toggle("selected", isSelected);
        }
    });
}

// Toggle selection state of individual cell
function toggleSlot(cell) {
    cell.classList.toggle("selected");
    UpdateApiData()
}

// Populate dropdown with tutor names
function populateFirstDropdown() {
    const firstSelect = document.getElementById("floatingSelect");
    firstSelect.innerHTML = "";
    for (const tutor in apiData) {
        const option = document.createElement("option");
        option.value = apiData[tutor].student_id;
        option.textContent =
            apiData[tutor].first_name + " " + apiData[tutor].last_name;
        firstSelect.appendChild(option);
    }
}

// Update API data with current calendar state
function UpdateApiData() {
    let tutorId = document.getElementById("floatingSelect").value
    let tutor = apiData.find(item => item.student_id == tutorId)
    tutor.schedule = CreateScheduleObject()
}

// Create schedule object from current calendar state
function CreateScheduleObject() {
    let schedule = {}
    days.forEach(day => {
        let boolArray = []
        for(let i = 0; i < 23; i++) {
            let cell = document.getElementById(i + day)
            boolArray.push(Number(cell.classList.contains("selected")))
        }
        let array = boolArrayToRanges(boolArray)
        schedule[day] = array
    })
    return schedule
}

// Convert boolean array to time ranges
function boolArrayToRanges(array) {
    let ranges = []
    let tracking = false
    let start = 0
    let end = 0
    for(let i = 0; i < 24; i++) {
        if(array[i] == true && tracking == false) {
            start = i
            tracking = true
        }
        if (array[i] == false && tracking == true) {
            end = i
            tracking = false
            ranges.push({Start: start, End: end - 1})
        }
        if (i == 23 && array[i] == true && tracking == true) {
            end = 24
            ranges.push({Start: start, End: end - 1})
        }
    }
    return ranges
}