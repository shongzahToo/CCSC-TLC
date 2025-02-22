window.onload = async function() {
    try {
        const response = await fetch('http://70.57.81.35:5000/getschedule')
        const apiData = await response.json()

        classes = {
            "Subject": {
                "Class": []
            }
        }

        Object.assign(classes, apiData)
        CreateTable()
        
    } catch (error) {
        document.getElementById("error").innerText = "An error occured, please try again later"
        Array.from(["selectBoxContainer", "calendarContainer"]).forEach(id => {
            document.getElementById(id).remove()
        })
        console.error('Failed to fetch schedule data:', error);
    }
};

var days = ["MON", "TUE", "WED", "THU", "FRI"];

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
    body.addEventListener("click",slotSelected);
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
            //Geof did this...
            var timeRange = `${(i + 7) % 12 + 1}:${!j ? '00' : '30'} ${i + 8 > 12 ? "PM" : "AM"} - ${(i + 7 + (j ? 1 : 0)) % 12 + 1}:${j ? '00' : '30'} ${i + 9 > 12 ? "PM" : "AM"}`
            col.innerHTML = timeRange
            row.appendChild(col);
            var timeslots = []
            for (let k = 0; k < 5; k++) {
                var empty = document.createElement('td');
                //k can be used to coorespond to the day of the week
                empty.id = `${slot-1}${days[k]}`
                row.appendChild(empty)
            }
            body.appendChild(row);
        }
    }
    table.appendChild(body);
}
function slotSelected(event)
{
    event.target.classList.toggle("selected");
}