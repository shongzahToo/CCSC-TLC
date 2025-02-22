var days = ["MON", "TUE", "WED", "THU", "FRI"];
CreateTable()
let tutors = [
    {
        "student_id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "classes": [
            {
                "class_id": 101,
                "number": 101,
                "subject": "MTH"
            },
            {
                "class_id": 202,
                "number": 202,
                "subject": "ENG"
            }
        ]
    },
    {
        "student_id": 2,
        "first_name": "Jane",
        "last_name": "Smith",
        "classes": [
            {
                "class_id": 150,
                "number": 150,
                "subject": "SCI"
            }
        ]
    },
    {
        "student_id": 3,
        "first_name": "Alice",
        "last_name": "Johnson",
        "classes": [
            {
                "class_id": 300,
                "number": 300,
                "subject": "HIS"
            },
            {
                "class_id": 220,
                "number": 220,
                "subject": "PHY"
            }
        ]
    }
]
setupSelect();
function setupSelect() {
    let tutorsSelect = document.getElementById("tutorSelect");
    let classesSelect = document.getElementById("classSelect");
    let departmentSelect = document.getElementById("departmentSelect");
    for (let i = 0; i < tutors.length; i++) {
        let option = document.createElement("option");
        option.innerText = tutors[i].first_name +" "+tutors[i].last_name;
        tutorsSelect.appendChild(option);
        for (let c = 0; c < tutors[i].classes.length; c++) {
            option = document.createElement("option");
            option.innerText = tutors[i].classes[c].subject;
            departmentSelect.appendChild(option);
            option = document.createElement("option");
            option.innerText = tutors[i].classes[c].subject;
            departmentSelect.appendChild(option);
        } 
    }
}
function populateFirstDropdown(classes) {
    const firstSelect = document.getElementById("floatingSelect")
    firstSelect.innerHTML = ""

    for (const subject in classes) {
        const option = document.createElement("option");
        option.value = subject;
        option.textContent = subject;
        firstSelect.appendChild(option);
    }

    firstSelect.addEventListener("change", () => UpdateSecondDropdown(classes));
}

function UpdateSecondDropdown(classes) {
    const secondSelect = document.getElementById("floatingSelect2");
    const selectedSubject = document.getElementById("floatingSelect").value;
    secondSelect.innerHTML = "";

    if (selectedSubject && classes[selectedSubject]) {
        const classCodes = classes[selectedSubject];
        for (const classCode in classCodes) {
            if (classCodes.hasOwnProperty(classCode)) {
                const option = document.createElement("option");
                option.value = classCode;
                option.textContent = classCode;
                secondSelect.appendChild(option);
            }
        }
    }

    secondSelect.addEventListener("change", updateCells);
}
document.getElementById("floatingSelect").addEventListener("change", () => {
    UpdateSecondDropdown(classes);
    updateCells();
});
document.getElementById("floatingSelect2").addEventListener("change", updateCells);

//Creates a pretty table
function CreateTable() {
    var table = document.getElementById('calendar');
    table.innerHtml = "";
    var header = document.createElement('thead');
    //Creates the headers for the table
    header.innerHTML =
        `<tr>
        <th scope = "col">Time</th>
        <th scope = "col">Monday</th>
        <th scope = "col">Tuesday</th>
        <th scope = "col">Wednesday</th>
        <th scope = "col">Thursday</th>
        <th scope = "col">Friday</th>
    </tr>`
    table.appendChild(header);

    var body = document.createElement('tbody');
    body.addEventListener("click", updateData);
    //slot cooresponds to the timeslot
    var slot = 0;
    for (let i = 0; i < 12; i++) {
        for (let j = 0; j < 2; j++) {
            var time = 0;
            var row = document.createElement('tr');

            if (i < 5) {
                time = i + 8;
            }
            else {
                time = i - 4;
            }
            var col = document.createElement('td');
            //Geof did this...
            var timeRange = `${(i + 7) % 12 + 1}:${!j ? '00' : '30'} ${i + 8 > 12 ? "PM" : "AM"} - ${(i + 7 + (j ? 1 : 0)) % 12 + 1}:${j ? '00' : '30'} ${i + 9 > 12 ? "PM" : "AM"}`
            col.innerHTML = timeRange
            row.appendChild(col);
            var timeslots = []
            for (let k = 0; k < 5; k++) {
                var empty = document.createElement('td');
                //k can be used to coorespond to the day of the week
                empty.id = `${slot}${days[k]}`
                row.appendChild(empty)
            }
            body.appendChild(row);
            slot++;
        }
    }
    table.appendChild(body);
}
const selectedTimes = new Map();
function updateData(clickEvent) {
    clickEvent.target.classList.toggle("selected");
    var selected = false;
    for (var i = 0; i < clickEvent.target.classList.length; i++) {
        if (clickEvent.target.classList[i] == "selected") {
            selected = true;
        }
    }
    var dayOfWeek = clickEvent.target.id.slice(1)
    var timeSlotId = clickEvent.target.id.substring(0, 1);
    if (clickEvent.target.id.length == 5) {
        timeSlotId = clickEvent.target.id.substring(0, 2);
        dayOfWeek = clickEvent.target.id.slice(2)
    }
    let times = selectedTimes.get(dayOfWeek);
    if (!times) {
        times = [];
    }
    if (selected) {
        times.push(timeSlotId);
    }
    else {
        let index = times.indexOf(timeSlotId);
        if (index > -1) { // only splice array when item is found
            times.splice(index, 1); // 2nd parameter means remove one item only
        }
    }
    selectedTimes.set(dayOfWeek, times);
    console.log(selectedTimes);
    formatData()
}
function formatData() {
    let array = Array.from(selectedTimes);
    let final = new Map();
    if (array) {
        for (let day = 0; day < array.length; day++) {
            array[day][1].sort();
            let start = array[day][1][0];
            let end = -999;
            let lastNum = start;
            for (let slot = 1; slot < array[day][1].length + 1; slot++) {
                if ((array[day][1][slot] && (Number(lastNum) + 1 !== Number(array[day][1][slot]))) || slot == array[day][1].length) {
                    end = lastNum;
                    let r = new Range(start, end);
                    start = array[day][1][slot];
                    console.log(r);
                }
                lastNum = array[day][1][slot];
            }
        }
    }
}
class Range {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
}