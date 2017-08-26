
var rocket; 
var population;
var lifespan = 500;
var count = 0;
var lifeP;
var target;

var rx = 120;
var ry = 230;
var rw = 2000;
var rh = 10;

function setup(){
    createCanvas(700, 500);
    rocket = new Rocket();
    population = new Population(); 
    lifeP = createP();
    target = new createVector(width / 2, 50);
}

function draw(){
    
    background(0);
    population.run();
    lifeP.html(count);
    count++;

    if (count == lifespan) {
        count = 0;
        population.evaluate();
        population.selection();
        // population = new Population(); 
    }

    fill('red');
    textSize(22);
    text("Terrorist", 310, 30);

    fill('green');
    noStroke();
    rect(120, 230, 2000, 5);

    fill('red');
    ellipse(target.x, target.y, 16, 16);

    
    fill('red');
    ellipse(350, 490, 16, 16);

    fill('red');
    textSize(22);
    text("Genetic AI Missiles", 260, 470);
}

function Population(){
    this.rockets = [];
    this.popsize = 150;
    this.matingpool = [];

    for (var i = 0; i < this.popsize; i++){
        this.rockets[i] = new Rocket();
    }

    this.evaluate = function(){

        var maxfit = 0;

        for (var i = 0; i < this.popsize; i++){
            this.rockets[i].calcFitness();
            if (this.rockets[i].fitness > maxfit){
                maxfit = this.rockets[i].fitness;
            }
        }   
        console.log(maxfit);
        //createP("Maximum fitness: "+maxfit);

        for (var i = 0; i < this.popsize; i++){
            this.rockets[i].fitness /= maxfit;
        }

        this.matingpool = [];
        for (var i = 0; i < this.popsize; i++){
            var n = this.rockets[i].fitness * 100;
            for (var j = 0; j < n; j++){
                this.matingpool.push(this.rockets[i]);  
            }
        }
    }


    this.selection = function(){

        var newrockets = [];

        for (var i = 0; i < this.rockets.length; i++){
            var parentA = random(this.matingpool).dna;
            var parentB = random(this.matingpool).dna;
            var child = parentA.crossover(parentB);
            child.mutation();
            newrockets[i] = new Rocket(child);
        }

        this.rockets = newrockets;
    }


    this.run = function(){
        for (var i = 0; i< this.popsize; i++){
            this.rockets[i].update();
            this.rockets[i].show();
        }
    }
}

function DNA(genes){

    if (genes) {
        this.genes = genes;
    } else {
        this.genes = [];
        for (var i = 0; i < lifespan; i++){
            this.genes[i] = p5.Vector.random2D();
            this.genes[i].setMag(0.3);
        }
    }

    this.crossover = function(partner) {
        var newgenes = [];
        var mid = floor(random(this.genes.length));

        for (var i = 0; i < this.genes.length; i++) {
            if (i > mid) { 
                newgenes[i] = this.genes[i]; 
            } else {
                newgenes[i] = partner.genes[i]; 
            }
        }
        return new DNA(newgenes);
    }

    this.mutation = function() {
        for (var i = 0; i < this.genes.length; i++) {
            if(random(1) < 0.01) {
                this.genes[i] = p5.Vector.random2D();
                this.genes[i].setMag(0.3);
            }
        }
    }
}

function Rocket(dna){

    this.pos = createVector(width / 2, height);
    this.vel = createVector();
    this.acc = createVector();

    this.completed = false;
    this.crashed = false;

    this.dna = new DNA();
    this.fitness = 0;

    if (dna) {
        this.dna = dna;
    } else {
        this.dna = new DNA();
    }

    this.applyForce = function(force){
        this.acc.add(force);
    }

    this.calcFitness = function(){
        var d = dist(this.pos.x, this.pos.y, target.x, target.y);
        this.fitness = map(d, 0, width, width, 0);

        if( this.completed ){
            this.fitness *= 10; 
        }

        if( this.crashed ){
            this.fitness = 1;
        }
    }

    this.update = function(){   

        var d = dist(this.pos.x, this.pos.y, target.x, target.y);
        
        if( d < 10 ){
            this.completed = true;
            this.pos = target.copy();
        }

        if (this.pos.x > rx && this.pos.x < rx + rw && this.pos.y > ry && this.pos.y < ry + rh ){
            this.crashed = true;
        }

        this.applyForce(this.dna.genes[count]);

        if( !this.completed && !this.crashed ){

            this.count++;
            this.vel.add(this.acc);
            this.pos.add(this.vel);
            this.acc.mult(0);
            this.vel.limit(4);
        }
    }

    this.show = function(){
        push();
        noStroke();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        rectMode(CENTER);
        fill('#ffa500');
        triangle(0, 0, 0, 10, 20, 5);

        pop();
    }

}