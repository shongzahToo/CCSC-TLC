let selectedTimes = {}; //
var days = ["MON", "TUE", "WED", "THU", "FRI"];

//pulls the table and initializes the calendar
window.onload = async function () {
    try {
        const response = await fetch("http://70.57.81.35:5000/tutors");
        apiData = await response.json();
        console.log("!You need more sleep.")
        console.log(apiData);
        pushData();
        populateFirstDropdown();
        updateCells();
    } catch (error) {
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

CreateTable();

class Range {
    constructor(Start, End) {
        this.Start = Start;
        this.End = End;
    }
}


//clears the apiData
function clearTableData() {
    clearTableDisplay();
    let person = document.getElementById("floatingSelect").value;
    for (let i = 0; i < apiData.length; i++) {
        if (apiData[i].student_id == person) {
            apiData[i].schedule = [];
        }
    }
}
//unfinished push method
function pushData() {
    // add empty schedules
    // push api data
    for (let i = 0; i < apiData.length; i++) {
        let tutor = apiData[i];
    }
}

document.getElementById("floatingSelect").addEventListener("change", () => {
    selectedTimes = []
    updateCells();
});
//visually delete the cells
function clearTableDisplay() {
    document.getElementById("calendar").innerHTML = "";
    CreateTable();
}
//Visual update cells
function updateCells() {
    var tbody = document.getElementById("calendar").children[1];
    //Get all cells(td) except the time
    var dayCells = [];
    for (let tr = 0; tr < tbody.children.length; tr++) {
        for (let td = 0; td < tbody.children[tr].children.length; td++) {
            if (td != 0) {
                dayCells.push(tbody.children[tr].children[td]);
            }
        }
    }
    let person = document.getElementById("floatingSelect").value;
    //this is an array of arrays that contains the start-end times
    var specificSchedule = [];
    for (let i = 0; i < apiData.length; i++) {
        if (apiData[i].student_id == person) {
            specificSchedule = apiData[i].schedule;
        }
    }
    dayCells.forEach((cell) => {
        if (!specificSchedule) {
            cell.classList.toggle("selected", false);
        } else {
            var isSelected = false;
            //grabbing day and time from cell id
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

//(BROKEN)go from click event to updated apiData(BROKEN)
function updateData(clickEvent) {
    
    if (clickEvent.target.innerHTML != "" || clickEvent.target.tagname == "TD") {
        return;
    }

    var selected = false;
    for (var i = 0; i < clickEvent.target.classList.length; i++) {
        if (clickEvent.target.classList[i] == "selected") {
            selected = true;
        }
    }
    var dayOfWeek = clickEvent.target.id.slice(1);
    var timeSlotId = clickEvent.target.id.substring(0, 1);
    if (clickEvent.target.id.length == 5) {
        timeSlotId = clickEvent.target.id.substring(0, 2);
        dayOfWeek = clickEvent.target.id.slice(2);
    }
    //times is an array
    let times = selectedTimes[dayOfWeek];
    let person = document.getElementById("floatingSelect").value;
    let personObj;
    for (let i = 0; i < apiData.length; i++) {
        if (apiData[i].student_id == person) {
            personObj = apiData[i]
        }
    }
    if (times) {
        times.concat(Object.entries(personObj.schedule)[dayOfWeek])
    }
    else {
        console.log(personObj)
        console.log(personObj.schedule)
        t = Object.entries(personObj.schedule)
        console.log(t)
        for (let i = 0; i < t.length; i++) {
            if (t[i][0] == dayOfWeek) {
                for (let j = t[i][1].Start; j < t[i][1].End; j++)
                    times.push(j);
            }
        }
    }
    console.log("times")
    console.log(times);
    if (selected) {
        if (times.indexOf(timeSlotId) == -1) {
            times.push(timeSlotId);
        } else {
            console.log("This line should never run");
        }
    } else {
        let index = times.indexOf(timeSlotId);
        if (index > -1) {
            // only splice array when item is found
            times.splice(index, 1); // 2nd parameter means remove one item only
        } else {
            console.log("This line should never run. Go to sleep.");
        }
    }
    if (selectedTimes[dayOfWeek]) {
        selectedTimes[dayOfWeek].concat(times);
    } else {
        selectedTimes[dayOfWeek] = times; // ["0", "1", "2", "3"] represents 8am - 10am
    }


    formatData();
}

//flip status of single cell given element
function toggleSlot(cell) {
    cell.classList.toggle("selected");
    updateData({ target: cell });
}
//Build data into ranges
function formatData() {
    let array = Object.entries(selectedTimes);
    let finalRanges = {};

    for (let day = 0; day < array.length; day++) {
        let starts = [];
        let ends = [];
        let activeTimeSlots = array[day][1].map((str) => parseInt(str));
        let timeSlots = [];
        let ranges = [];
        for (let i = 0; i < 24; i++) {
            if (activeTimeSlots.indexOf(i) > -1) {
                timeSlots.push(1);
            } else {
                timeSlots.push(0);
            }
        }
        if (timeSlots[0] == 1) {
            starts.push(0);
        }
        if (timeSlots[23] == 1) {
            ends.push(23);
        }
        for (let i = 1; i < 23; i++) {
            if (timeSlots[i] == 0 && timeSlots[i - 1] == 1) {
                ends.push(i - 1);
            }
            if (timeSlots[i - 1] == 0 && timeSlots[i] == 1) {
                starts.push(i);
            }
        }
        for (let i = 0; i < starts.length; i++) {
            ranges.push(new Range(starts[i], ends[i]));
        }
        finalRanges[array[day][0]] = ranges;
    }

    //append the ranges to the tutor objects in the tutors array
    let tutorId = document.getElementById("floatingSelect").value;
    apiData = addRangeToStudent(finalRanges, tutorId);
}
//updates students schedule with a rangeMap which is a list of Range objects
function addRangeToStudent(rangeMap, studentId) {
    return apiData.map((student) => {
        if (student.student_id === studentId) {
            return { ...student, schedule: rangeMap };
        }
        return student;
    });
}

var body = document.createElement("tbody");

let isMouseDown = false;

var table = document.getElementById("calendar")

table.addEventListener("mousedown", (event) => {
    if (event.button == 0) {
        if (event.target.tagName === "TD" && event.target.id) {
            isMouseDown = true;
            toggleSlot(event.target);
        }
        event.preventDefault();
    }
});

table.addEventListener("mouseover", (event) => {
    if (isMouseDown && event.target.tagName === "TD" && event.target.id) {
        toggleSlot(event.target);
    }
});

table.addEventListener("mouseup", (event) => {
    if (event.button == 0) {
        isMouseDown = false;
    }
});
let clear = document.getElementById("clear");
clear.addEventListener("click", clearTableData);

//updates dropdown with student names and ids
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