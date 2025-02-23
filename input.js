const selectedTimes = new Map();
var days = ["MON", "TUE", "WED", "THU", "FRI"];

window.onload = async function() {
    try {
        const response = await fetch('http://70.57.81.35:5000/tutors')
        apiData = await response.json()
        console.log(apiData)
    } catch(error) {
        document.getElementById("error").innerText = "An error occured, please try again later"
        Array.from(["selectBoxContainer", "calendarContainer"]).forEach(id => {
            document.getElementById(id).remove()
        })
        console.error('Failed to fetch schedule data:', error);
    }
    populateFirstDropdown()
}
CreateTable()

class Range {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
}

function populateFirstDropdown() {
    const firstSelect = document.getElementById("floatingSelect");
    firstSelect.innerHTML = "";

    for (const tutor in apiData) {
        const option = document.createElement("option");
        option.value = apiData[tutor].student_id;
        option.textContent = apiData[tutor].first_name + " " + apiData[tutor].last_name;
        firstSelect.appendChild(option);
    }
}



function updateCells() {
    var tbody = document.getElementById("calendar").children[1];
    //Get all cells(td) except the time
    var dayCells = [];
    for (let tr = 0; tr < tbody.children.length; tr++) {
        for (let td = 0; td < tbody.children[tr].children.length; td++) {
            if(td != 0)
            {
                dayCells.push(tbody.children[tr].children[td]);
            }
        }
    }
    //this needs to be a array of arrays that contains the start-end times
    var specificSchedule = [];
    dayCells.forEach(day => {
        if (!specificSchedule) {
            day.classList.toggle("selected", false)
        } else {
            var isSelected = false;
            //grabbing day and time from cell id
            var dayOfWeek = day.id.slice(1);
            var timeSlotId = day.id.substring(0,1);
            if(day.id.length == 5)
            {
                timeSlotId = day.id.substring(0,2);
                dayOfWeek = day.id.slice(2);
            }
            
            var timeSlots = specificSchedule[dayOfWeek];

            if (timeSlots) {
                timeSlots.forEach(range => {
                    if(((range[0]) <= (timeSlotId)) && ((timeSlotId) <= (range[1] - 1))) {
                        title = `${(Math.floor(range[0] / 2) + 7) % 12 + 1}:${((range[0] - 1) % 2) ? "00" : "30"} ${(range[0] - 1)>8 ? "PM" : "AM"}` +
                            ` - ${Math.floor((range[1]) / 2 + 7) % 12 + 1}:${((range[1]) % 2) ? "30" : "00"} ${(range[1])>8 ? "PM" : "AM"}`
                            isSelected = true;
                    }
                });
            }
            day.classList.toggle("selected", isSelected);
        }
    });
}







var body = document.createElement("tbody");

let isMouseDown = false;

var table = document.getElementById("calendar");

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

document.getElementById("submit").addEventListener("click", updateData);

function updateData(clickEvent) {
    if (clickEvent.target.innerHTML != "") {
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
    let times = selectedTimes.get(dayOfWeek);
    if (!times) {
        times = [];
    }
    if (selected) {
        if (times.indexOf(timeSlotId) == -1) {
            times.push(timeSlotId);
        }
    } else {
        let index = times.indexOf(timeSlotId);
        if (index > -1) {
            // only splice array when item is found
            times.splice(index, 1); // 2nd parameter means remove one item only
        }
    }
    selectedTimes.set(dayOfWeek, times);
    formatData();
}

function toggleSlot(cell) {
    cell.classList.toggle("selected");
    updateData({ target: cell });
}

function formatData() {
    let array = Array.from(selectedTimes);
    let finalRanges = new Map()

    console.log("Start Formating");
    //console.log(array)
    for (let day = 0; day < array.length; day++) {
        let starts = [];
        let ends = [];
        let activeTimeSlots = array[day][1].map((str) => parseInt(str));
        let timeSlots = [];
        let ranges = []
        for (let i = 0; i < 24; i++) {
            if (activeTimeSlots.indexOf(i) > -1) {
                timeSlots.push(1);
            } else {
                timeSlots.push(0);
            }
        }
        if (timeSlots[0] == 1) {
            starts.push(0)
        }
        if (timeSlots[23] == 1) {
            ends.push(23)
        }
        for (let i = 1; i < 23; i++) {
            if ((timeSlots[i] == 0) && (timeSlots[i - 1] == 1)) {
                ends.push(i - 1)
            }
            if ((timeSlots[i - 1] == 0) && (timeSlots[i] == 1)) {
                starts.push(i)
            }
        }
        for (let i = 0; i < starts.length; i++) {
            ranges.push(new Range(starts[i], ends[i]))
        }
        finalRanges.set(array[day][0], ranges)
    }
    console.log(finalRanges)
    //append the ranges to the tutor objects in the tutors array
    let tutorId = document.getElementById("floatingSelect").value

    apiData = addRangeToStudent(finalRanges, tutorId)
    console.log(apiData)
}


function addRangeToStudent(rangeMap, studentId) {
    return apiData.map(student => {
        if (student.student_id === studentId) {
            return { ...student, range: rangeMap };
        }
        return student;
    });
}