class Draggable{
    static dragLocked = false;

    constructor(col,row,w,h,imageData){
        this.img = createImage(w,h);
        this.size = createVector(this.img.width,this.img.height);
        this.halfSize = createVector(this.img.width/2,this.img.height/2);
        this.colRowPos = {
            col: col,
            row: row
        };
        this.position = createVector(this.size.x*col,this.size.y*row);
        this.img.loadPixels();
        for(let i=0; i < this.img.width * this.img.height*4; i++){
            this.img.pixels[i] = imageData[i];
        }
        this.img.updatePixels();

        this.isDragging = false;
        this.closestHook = null;
    }

    update(){
        if(mouseX > this.position.x &&
            mouseX < this.position.x + this.size.x &&
            mouseY > this.position.y &&
            mouseY < this.position.y + this.size.y && 
            mouseIsPressed===true)
        {
            if(!Draggable.dragLocked){
                this.isDragging = true;
                Draggable.dragLocked = true;
            }

            if(this.isDragging){
                this.position.x = mouseX - this.size.x*0.5;
                this.position.y = mouseY - this.size.y*0.5;
            }

            let smallest = Infinity;
            for(let hook of hooks){
                let distance = dist(this.position.x+this.halfSize.x,this.position.y+this.halfSize.y,hook.x,hook.y);
                if(distance < smallest){
                    smallest = distance;
                    this.closestHook = hook;
                }
            }
        }
        else{
            if(this.isDragging){
                this.isDragging = false;
                Draggable.dragLocked = false;
                this.position = this.closestHook.copy().sub(this.halfSize);
            }
        }
    }

    show(){
        image(this.img,
              this.position.x,
              this.position.y);
        if(this.isDragging)
        {
            strokeWeight(4);
            stroke("#e27d60");
            line(this.position.x+this.halfSize.x,this.position.y+this.halfSize.y,this.closestHook.x,this.closestHook.y)
        }
    }
}