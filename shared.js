
    //Fill nav and footers
    var nav = document.getElementById('nav');
    var footer = document.getElementById('footer');
    nav.innerHTML = `
    <div class="container d-flex flex-wrap">
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
    <p>Ozarks Technical Community College</p>
    <p>1001 E. Chestnut Expressway,Springfield, MO 65802 | (417) 447-7500</p>
    <a href="input.html">Admin</a>
  </div>`

function CreateTable(){
    var table = document.getElementById('calendar');
    table.innerHtml = "";
    var header = document.createElement('thead');
    //Creates the headers for the table
    header.innerHTML = 
    `<tr>
        <th scope = "col" class="corner_left">Time</th>
        <th scope = "col">Monday</th>
        <th scope = "col">Tuesday</th>
        <th scope = "col">Wednesday</th>
        <th scope = "col">Thursday</th>
        <th scope = "col" class="corner_right">Friday</th>
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