var days = ["MON", "TUE", "WED", "THU", "FRI"];
CreateTable()
function setupSelect(tutors)
{
    let tutorsSelect = document.getElementById("tutorSelect");
    let classesSelect = document.getElementById("classSelect");
    for (let i = 0; i < tutors.length; i++) {
        let option = document.createElement("option");
        option.innerText = tutors[i][0];
        tutorsSelect.appendChild(option);

        option = document.createElement("option");
        for (let c = 1; c < tutors[i].length; c++) {
            option.innerText = tutors[i][c];
        }
        classesSelect.appendChild(option);
    }
}
//Creates a pretty table
function CreateTable(){
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
    body.addEventListener("click",updateData);
    //slot cooresponds to the timeslot
    var slot = 0;
    for (let i = 0; i < 12; i++) {
        for (let j = 0; j < 2; j++) {
            var time = 0;
            var row = document.createElement('tr');
            
            if(i < 5){
                time = i + 8;
            }
            else{
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
    const cell = clickEvent.target
    const isSelected = cell.classList.contains("selected")

    let dayOfWeek = cell.id.slice(1)
    let timeSlotId = cell.id.substring(0, 1)

    if (cell.id.length == 5) {
        timeSlotId = cell.id.substring(0, 2)
        dayOfWeek = cell.id.slice(2)
    }

    let times = selectedTimes.get(dayOfWeek) || []

    if (isSelected) {
        if (!times.includes(timeSlotId)) {
            times.push(timeSlotId)
        }
    } else {
        let index = times.indexOf(timeSlotId)
        if (index > -1) {
            times.splice(index, 1)
        }
    }

    selectedTimes.set(dayOfWeek, times)
    console.log(selectedTimes)
    formatData()
}

let isMouseDown = false
let startSlot = null

document.addEventListener("mousedown", (event) => {
    if (event.target.tagName === "TD" && event.target.id) {
        isMouseDown = true
        startSlot = event.target
        toggleSlot(event.target)
        event.preventDefault()
    }
});

document.addEventListener("mouseover", (event) => {
    if (isMouseDown && event.target.tagName === "TD" && event.target.id) {
        toggleSlot(event.target)
    }
});

document.addEventListener("mouseup", () => {
    isMouseDown = false
    startSlot = null
});

function toggleSlot(cell) {
    cell.classList.toggle("selected")
    updateData({ target: cell })
}


function formatData()
{
    let array = Array.from(selectedTimes);
    let final = new Map();
    if(array)
    {
        for (let day = 0; day < array.length; day++) {
            array[day][1].sort();
            let start = array[day][1][0];
        let end = -999;
        let lastNum = start;
        for (let slot = 1; slot < array[day][1].length+1; slot++) {
            if((array[day][1][slot] && (Number(lastNum)+1 !== Number(array[day][1][slot])))||slot == array[day][1].length)
            {
                end = lastNum;
                let r = new Range(start,end);
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