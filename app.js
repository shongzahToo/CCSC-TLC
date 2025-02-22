window.onload = async function() {
    try {
        const response = await fetch('http://70.57.81.35:5000/getschedule')
        const apiData = await response.json()

        classes = {
            "Subject": {
                "Class": []
            }
        }

        //Fill nav and footers
        var nav = document.getElementById('nav');
        var footer = document.getElementById('footer');
        nav.innerHTML = `<div class="container d-flex flex-wrap">
            <ul class="nav me-auto">
                <a class="logo" href = "home.html">
                </a>
                <li class="nav-item"><a href="index.html" class="text nav-link px-2 active" aria-current="page">Schedules</a></li>
                <li class="nav-item"><a href="#" class="text nav-link px-2">Cost & Aids</a></li>
                <li class="nav-item"><a href="#" class="text nav-link px-2">Admissions</a></li>
                <li class="nav-item"><a href="#" class="text nav-link px-2">Services</a></li>
                <li class="nav-item"><a href="#" class="text nav-link px-2">About</a></li>
            </ul>
        </div>`
        footer.innerHTML = `<div class="container">
        <p>Put footer stuff here</p>
      </div>`


        Object.assign(classes, apiData)
        populateFirstDropdown(classes)
        UpdateSecondDropdown(classes)
        CreateTable()
        updateCells()
        
    } catch (error) {
        document.getElementById("error").innerText = "An error occured, please try again later"
        Array.from(["selectBoxContainer", "calendarContainer"]).forEach(id => {
            document.getElementById(id).remove()
        })
        console.error('Failed to fetch schedule data:', error);
    }
};

var days = ["MON", "TUE", "WED", "THU", "FRI"];

const calendar = document.getElementById("calendar");

document.getElementById("floatingSelect").addEventListener("change", () => {
    UpdateSecondDropdown(classes);
    updateCells();
});
document.getElementById("floatingSelect2").addEventListener("change", updateCells);

function updateCells() {

    //Get index from drop down
    var tbody = document.getElementById("calendar").children[1];
    var dayCells = [];
    for (let tr = 0; tr < tbody.children.length; tr++) {
        for (let td = 0; td < tbody.children[tr].children.length; td++) {
            if(td != 0)
            {
                dayCells.push(tbody.children[tr].children[td]);
            }
        }
    }
    var subject = document.getElementById("floatingSelect").value;
    var classCode = document.getElementById("floatingSelect2").value;
    var specificSchedule = classes[subject] && classes[subject][classCode]
    dayCells.forEach(day => {
        if (!specificSchedule) {
            day.classList.toggle("selected", false)
        } else {
            var isSelected = false
            var isStart = false
            var isEnd = false
            var title = ""
            
            //grabbing day and time from cell id
            var dayOfWeek = day.id.slice(1)
            var timeSlotId = day.id.substring(0,1);
            if(day.id.length == 5)
            {
                timeSlotId = day.id.substring(0,2);
                dayOfWeek = day.id.slice(2)
            }
            
            var timeSlots = specificSchedule[dayOfWeek]

            if (timeSlots) {
                timeSlots.forEach(range => {
                    if((timeSlotId) == (range[0])) {
                        isStart = true
                    } else if ((timeSlotId) == (range[1] - 1)){
                        isEnd = true
                    }
                    if(((range[0]) <= (timeSlotId)) && ((timeSlotId) <= (range[1] - 1))) {
                        console.log(`${range[0]} <= ${timeSlotId} <= ${range[1] - 1}`)
                        title = `${(Math.floor(range[0] / 2) + 7) % 12 + 1}:${((range[0] - 1) % 2) ? "00" : "30"} ${(range[0] - 1)>8 ? "PM" : "AM"}` +
                            ` - ${Math.floor((range[1]) / 2 + 7) % 12 + 1}:${((range[1]) % 2) ? "30" : "00"} ${(range[1])>8 ? "PM" : "AM"}`
                            isSelected = true
                    }
                });
            }
            day.classList.toggle("selected", isSelected)
            day.classList.toggle("start", isStart)
            
            day.innerHTML = (isStart ? title : " ")
            
            day.classList.toggle("end", isEnd)
        }
    });
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
