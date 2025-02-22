window.onload = async function() {
    try {
        const response = await fetch('http://70.57.81.35:5000/getschedule')
        const apiData = await response.json()

        classes = {
            "subject": {
                "Class": []
            }
        }

        Object.assign(classes, apiData)
        populateFirstDropdown(classes)
        UpdateSecondDropdown(classes)

        updateCells()
        
    } catch (error) {
        console.error('Failed to fetch schedule data:', error);
    }
};

var days = ["MON", "TUE", "WED", "THU", "FRI"];

const calendar = document.getElementById("calendar");

// for (let i = 7; i < 19; i++) {
//     for (let j = 0; j < 2; j++) {
//         //don't touch
//         let timeLabel = `${i + 7 % 12 + 1}:${!j ? '00' : '30'} ${i + 8 > 12 ? "PM" : "AM"} - ${(i + 7 +(j ? 1 : 0)) % 12 + 1}:${j ? '00' : '30'} ${i + 9 > 12 ? "PM" : "AM"}`;
//         let timeSlot = document.createElement("div");
//         timeSlot.textContent = timeLabel;

//         //every other line
//         timeSlot.classList.add(j ? "highlight" : "not-highlighted")

//         //every line
//         calendar.appendChild(timeSlot);

//         for (let d = 0; d < 5; d++) {
//             let slot = document.createElement("div");
//             //classes for calender slots
//             slot.classList.add("time-slot", j ? "highlight" : "not-highlighted");
//             //ID for calender slot
//             slot.id = days[d] + "-" + (((i - 7) * 2 + j));
//             calendar.appendChild(slot);
//         }
//     }
// }

CreateTable()

function updateCells() {

    //Get index from drop down
    var dayCells = Array.from(document.getElementById("calendar").children).slice(6).filter((_, index) => (index) % 6 !== 0);
    var subject = document.getElementById("floatingSelect").value;
    var classCode = document.getElementById("floatingSelect2").value;
    var specificSchedule = classes[subject] && classes[subject][classCode]

    dayCells.forEach(day => {
        if (!specificSchedule) {
            day.classList.toggle("selected", false)
        } else {
            var isSelected = false
            var dayOfWeek = day.id.substring(0, 3)
            var timeSlotId = day.id.slice(4)
            var timeSlots = specificSchedule[dayOfWeek]

            if (timeSlots) {
                timeSlots.forEach(range => {
                    for (let i = range.Start; i <= range.End; i++) {
                        if (timeSlotId == i) {
                            isSelected = true
                        }
                    }
                });
            }

            day.classList.toggle("selected", isSelected)
        }
    });
}

document.getElementById("floatingSelect").addEventListener("change", () => {
    UpdateSecondDropdown(classes);
    updateCells();
});
document.getElementById("floatingSelect2").addEventListener("change", updateCells);

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

    //slot cooresponds to the timeslot
    var slot = 0;
    for (let i = 0; i < 12; i++) {
        for (let j = 0; j < 2; j++) {
            slot++;
            var time = 0;
            var row = document.createElement('tr');
            
            if(i < 5){
                time = i + 8;
            }
            else{
                time = i - 4;
            }
            var col = document.createElement('td');
            //Gef did this...
            col.innerHTML = `${(i + 7) % 12 + 1}:${!j ? '00' : '30'} ${i + 8 > 12 ? "PM" : "AM"} - ${(i + 7 + (j ? 1 : 0)) % 12 + 1}:${j ? '00' : '30'} ${i + 9 > 12 ? "PM" : "AM"}`
            row.appendChild(col);
            var timeslots = []
            for (let k = 0; k < 5; k++) {
                var empty = document.createElement('td');
                //k can be used to coorespond to the day of the week
                empty.id = `${slot}${k}`
                row.appendChild(empty)
            }
            body.appendChild(row);
        }
    }
    table.appendChild(body);
}