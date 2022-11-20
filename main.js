let map;
let canvas;
let draggables = [];
let draggableCnt = 4;
let shuffleBtn;
let draggableSizeX;
let draggableSizeY;
let hooks = [];
let gameStarted = false;
let previousMarker;
function setup(){
    let latInput = document.getElementById("lat");
    let longInput = document.getElementById("long");
    document.getElementById("set-btn").addEventListener("click",() => {
        map.setView([latInput.value, longInput.value], 13);
    });

    shuffleBtn = document.getElementById("shuffle-btn");
    shuffleBtn.addEventListener("click",()=>{
        if(!shuffleBtn.classList.contains("disabled")){
            shuffledraggables();
            shuffleBtn.classList.add("disabled");
        }
    })

    document.getElementById("current-location-btn").addEventListener("click",()=>{
        map.locate({ setView: true }); 
    });

    document.getElementById("create-btn").addEventListener("click",()=>{
        createdraggables();
    });

    map = L.map('map-wrapper',{
        renderer: L.canvas()
    }).setView([latInput.value, longInput.value], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    map.on("click",(e)=>{
        latInput.value = e.latlng.lat;
        longInput.value = e.latlng.lng;
        if(previousMarker)
            map.removeLayer(previousMarker);
        previousMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
    });

    canvas = createCanvas(600,600);
    canvas.parent("canvas-wrapper");

    draggableSizeX = width/draggableCnt;
    draggableSizeY = height/draggableCnt;
}

function draw(){
    background("#e8a87c");
    for(let i=draggables.length-1;i>=0;i--){
        draggables[i].update();
        if(draggables[i].isDragging && draggables[i] != draggables.at(-1)){
            let ref = draggables[i];
            draggables.splice(i, 1);
            draggables.push(ref);
            continue;
        }
    }

    for(let draggable of draggables){
        draggable.show();
    }

    fill("#41b3a3");
    noStroke();
    for(let hook of hooks){
        ellipse(hook.x,hook.y,16,16);
    }
    if(gameStarted)
        checkWin();
}


function createdraggables(){
    html2canvas(document.querySelector("#map-wrapper"),{
        allowTaint: true,
        height: 600,
        width: 600,
        useCORS: true
    }).then(tempCanvas => {
        hooks = [];
        draggables = [];
        for(let row = 0; row < draggableCnt; row++){
            for(let col = 0; col < draggableCnt; col++){
                let data = tempCanvas.getContext("2d").getImageData(draggableSizeX*col,draggableSizeY*row,draggableSizeX,draggableSizeY).data;
                let draggable = new Draggable(col,row,draggableSizeX,draggableSizeY,data);
                hooks.push(createVector(col*draggableSizeX + draggableSizeX/2,row*draggableSizeY + draggableSizeY/2))
                draggables.push(draggable);
            }
        }
        shuffleBtn.classList.remove("disabled");
    });
}

function shuffledraggables(){
    let positions = [];
    for(let point of hooks){
        positions.push(point.copy().sub(draggableSizeX*0.5, draggableSizeY*0.5));
    }
    positions = shuffle(positions);
    for(let draggable of draggables){
        draggable.position = positions.pop();
    }
    gameStarted = true;
}

function checkWin(){
    let win = true;
    for(let draggable of draggables){
        if(draggable.closestHook == null)
            return;
        let hookCol = floor(draggable.closestHook.x / draggableSizeX);
        let hookRow = floor(draggable.closestHook.y / draggableSizeY);
        if(draggable.colRowPos.col != hookCol || draggable.colRowPos.row != hookRow){
            win = false;
            break;
        }
    }
    
    if(win){
        let notification = new Notification("YOU WON");
        gameStarted = false;
        if (Notification.permission === "granted") 
                {
                   const notification = new Notification("YOU WON");
                }
                else if (Notification.permission !== "denied") 
                {
                    Notification.requestPermission().then((permission) => {
                        if (permission === "granted") 
                        {
                            const notification = new Notification("YOU WON");
                        }
                    });
                }
    }
}
