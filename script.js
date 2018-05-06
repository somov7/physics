var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

var valve_state = false; // Клапан, true = открыт
var bulb_state = true; // Груша, true = разжата
var ballast_h = 200; // Высота балластного груза
var bulb_close_degree = 1; // 0 - открыта, 1 - закрыта
var bulb_press_time;
var stop_cycle = true;

var lastTime;
var thisTime;
var deltaTime;

var timeScale = 1;

const startx = -50, starty = 150;
const bulb_press_period = 150;

/* Физика */
const bulb_volume = 0.5;
const bottle_volume = 5;

/* Конец физики */

function drawFloor(sx, sy){
	ctx.beginPath();
	ctx.moveTo(sx + 50, sy + 600);
	ctx.lineTo(sx + 960, sy + 600);	
	ctx.stroke();

	for (var i = 0; i < 22; ++i) {
      ctx.beginPath();
      ctx.moveTo(sx + 60 + i * 40, sy + 640);
      ctx.lineTo(sx + 100 + i * 40, sy + 600);
      ctx.stroke();
    }
}

function drawValve(sx, sy){
	if (valve_state){
		ctx.beginPath();
		ctx.moveTo(sx + 252.1, sy + 61);
		ctx.lineTo(sx + 259, sy + 57);
		ctx.stroke();
	}
	else{
		ctx.beginPath();
		ctx.moveTo(sx + 259,sy + 65);
		ctx.lineTo(sx + 259,sy + 57);
		ctx.stroke();
	}

}

function drawBottle(sx, sy){
	/*Bottom part*/
	ctx.beginPath();
	ctx.moveTo(sx + 150,sy + 120);
	ctx.lineTo(sx + 150,sy + 580);
	ctx.arcTo(sx + 150, sy + 600, sx + 170, sy + 600, 20);
	ctx.lineTo(sx + 380,sy + 600);
	ctx.arcTo(sx + 400,sy + 600,sx + 400,sy + 580,20);
	ctx.lineTo(sx + 400,sy + 120);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(sx + 170,sy + 120,20,Math.PI, 1.333*Math.PI);
	ctx.lineTo(sx + 255,sy + 80);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(sx + 295,sy + 80);
	ctx.arc(sx + 380,sy + 120,20,1.667*Math.PI, 2*Math.PI);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(sx + 249,sy + 71,10, 0.333*Math.PI, 0, true);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(sx + 301,sy + 71,10, 0.667*Math.PI, Math.PI);
	ctx.stroke();

	/*Top part*/
	ctx.beginPath();
	ctx.moveTo(sx + 284 - 25,sy + 71);
	ctx.lineTo(sx + 284 - 25,sy + 65);
	ctx.moveTo(sx + 284 - 25,sy + 57);
	ctx.lineTo(sx + 284 - 25,sy + 50);
	ctx.lineTo(sx + 297 - 25,sy + 50);
	ctx.moveTo(sx + 303 - 25,sy + 50);
	ctx.lineTo(sx + 316 - 25,sy + 50);
	ctx.lineTo(sx + 316 - 25,sy + 57);
	ctx.moveTo(sx + 316 - 25,sy + 65);
	ctx.lineTo(sx + 316 - 25,sy + 71);
	ctx.stroke();
}

function drawRuler(sx, sy){
	ctx.rect(sx + 660, sy - 100, 80, 700);
	ctx.stroke();

	for(var i = 0; i < 151; i++){
		ctx.beginPath();
		ctx.moveTo(sx + 660, sy + 450 - 3 * i);
		if(i % 10 == 0){
			ctx.lineTo(sx + 710, sy + 450 - 3 * i);
			ctx.fillText("" + i / 10, sx + 715, sy + 453 - 3 * i);
		}
		else if(i % 5 == 0)
			ctx.lineTo(sx + 695, sy + 450 - 3 * i);
		else
			ctx.lineTo(sx + 680, sy + 450 - 3 * i);
		ctx.stroke();
	}
}

function drawStraw(sx, sy){
	ctx.beginPath();
	ctx.moveTo(sx + 290,sy + 57);
	ctx.lineTo(sx + 340,sy + 57);
	ctx.bezierCurveTo(sx + 420, sy + 57, sx + 420, sy - 100, sx + 540, sy - 100);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(sx + 290,sy + 65);
	ctx.lineTo(sx + 340,sy + 65);
	ctx.bezierCurveTo(sx + 428, sy + 65, sx + 428, sy - 92, sx + 540, sy - 92);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(sx + 540, sy, 100, 1.5*Math.PI, 2*Math.PI);
	ctx.lineTo(sx + 640, sy + 450);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(sx + 540, sy, 92, 1.5*Math.PI, 2*Math.PI);
	ctx.lineTo(sx + 632, sy + 450);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(sx + 732, sy + 450, 100, Math.PI, 2*Math.PI, true);
	ctx.lineTo(sx + 832, sy + 450 - ballast_h);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(sx + 732, sy + 450, 92, Math.PI, 2*Math.PI, true);
	ctx.lineTo(sx + 824, sy + 450 - ballast_h);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(sx + 832, sy + 450 - ballast_h);
	ctx.lineTo(sx + 832 + 50, sy + 450 - ballast_h);
	ctx.lineTo(sx + 832 + 50, sy + 300 - ballast_h);
	ctx.lineTo(sx + 824 - 50, sy + 300 - ballast_h);
	ctx.lineTo(sx + 824 - 50, sy + 450 - ballast_h);
	ctx.lineTo(sx + 824, sy + 450 - ballast_h);
	ctx.stroke();
}

function drawBulb(sx, sy){
	var bulb_gate_r = 150;
	
	if(bulb_state)
		bulb_close_degree = 0;
	else
		bulb_close_degree = Math.min((thisTime - bulb_press_time) * timeScale / bulb_press_period, 0.99);
	
	var bulb_gate_theta = Math.PI * 0.333 * (1 - bulb_close_degree) + Math.PI * 0.5 * bulb_close_degree; 

	ctx.beginPath();
	ctx.moveTo(sx + 265, sy + 50);
	ctx.lineTo(sx + 265 - bulb_gate_r * Math.cos(bulb_gate_theta),sy + 50 - bulb_gate_r * Math.sin(bulb_gate_theta));
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(sx + 285, sy + 50);
	ctx.lineTo(sx + 285 + bulb_gate_r * Math.cos(bulb_gate_theta),sy + 50 - bulb_gate_r * Math.sin(bulb_gate_theta));
	ctx.stroke();

	if(bulb_close_degree > 0.1){

		let t = Math.tan(bulb_gate_theta);
		let l = 90 + 10 * t;
		let r = 50;
		let alpha = Math.PI * 0.5 - bulb_gate_theta;
		let gamma = Math.PI - Math.asin(l / r * Math.sin(alpha));
		let beta = Math.PI - alpha - gamma;
		let phi = 2 * alpha + beta;

		ctx.beginPath();
		ctx.arc(sx + 275, sy - 40, 50, 1.5*Math.PI - phi, 1.5*Math.PI + phi);
		ctx.stroke();	

		ctx.beginPath();
		ctx.moveTo(sx + 279, sy + 50);
		ctx.quadraticCurveTo(sx + 278, sy + 18, sx + Math.min(298, 285 + 46 / t), sy + 4);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(sx + 271, sy + 50);
		ctx.quadraticCurveTo(sx + 272, sy + 18, sx + Math.max(252, 265 - 46 / t), sy + 4);
		ctx.stroke();

		if(bulb_close_degree < 0.45){
			ctx.beginPath();
			ctx.arc(sx + 275, sy - 40, 50, 0.5*Math.PI + beta, 0.65*Math.PI, true);
			ctx.stroke();

			ctx.beginPath();
			ctx.arc(sx + 275, sy - 40, 50, 0.5*Math.PI - beta, 0.35*Math.PI);
			ctx.stroke();
		}
	}
	else{

		ctx.beginPath();
		ctx.arc(sx + 275, sy - 40, 50, 0.35*Math.PI, 0.65*Math.PI, true);
		ctx.stroke();	


		ctx.beginPath();
		ctx.moveTo(sx + 279, sy + 50);
		ctx.quadraticCurveTo(sx + 278, sy + 18, sx + 298, sy + 4);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(sx + 271, sy + 50);
		ctx.quadraticCurveTo(sx + 272, sy + 18, sx + 252, sy + 4);
		ctx.stroke();

	}
}

function drawWater(sx, sy, water_h){
	if(water_h > 400)
		water_h = 400;
	if(water_h < 0)
		water_h = 0;
	var bulb_water_h = 50 + (400 - ballast_h) * 0.025 + (400 - ballast_h) * 0.025;

	ctx.lineWidth = 6;
	ctx.strokeStyle="#0099FF";

	ctx.beginPath();
	ctx.moveTo(sx + 636, sy + 450 - water_h - bulb_water_h);
	ctx.lineTo(sx + 636, sy + 450);
	ctx.arc(sx + 636 + 96,sy + 450, 96, Math.PI, 2*Math.PI, true);
	ctx.lineTo(sx + 828, sy + 450 - ballast_h - 1);
	ctx.stroke();

	ctx.fillStyle="#0099FF";
	ctx.fillRect(sx + 775, sy + 450 - ballast_h - bulb_water_h, 106, bulb_water_h - 1);

	ctx.fillStyle="#000000";

	ctx.lineWidth = 1;
	ctx.strokeStyle="#000000";

}

function valveButtonCaptionUpdate(){
	if(valve_state)
		document.getElementById("valveButton").value="Закрыть клапан";
	else
		document.getElementById("valveButton").value="Открыть клапан";
}

function changeValveState(){
	valve_state = !valve_state;
	valveButtonCaptionUpdate();
	redraw();
}

function pressBulb(){
	bulb_state = false;
	stop_cycle = false;
	bulb_press_time = performance.now();
	document.getElementById("bulbButton").disabled = true;
	document.getElementById("ballastHeight").disabled = true;
	document.getElementById("ballastHeight").hidden = true;
	cycle();
}

function setBallastHeight(){
	ballast_h = parseInt(document.getElementById("ballastHeight").value, 10);
	redraw();
}

function changeTimeScale(){
	timeScale = Math.pow(2, document.getElementById("timeScaleRange").value);
	document.getElementById("timeScaleCaption").innerHTML = timeScale + "x";
}

function redraw(){
	ctx.clearRect(0, 0, 1200, 800);
	drawFloor(startx, starty);
	drawBottle(startx, starty);
	drawValve(startx, starty);
	drawStraw(startx, starty);
	drawRuler(startx, starty);
	drawBulb(startx, starty);
	drawWater(startx, starty, ballast_h);
}

function reset(){
	valve_state = false;
	bulb_state = true;
	ballast_h = 200;
	timeScale = 1;
	document.getElementById("bulbButton").disabled = false;
	document.getElementById("ballastHeight").disabled = false;
	document.getElementById("ballastHeight").hidden = false;
	document.getElementById("ballastHeight").value = 200;
	document.getElementById("timeScaleRange").value = 0;
	document.getElementById("timeScaleRange").innerHTML = "1x";
	valveButtonCaptionUpdate();
	redraw();
}

function stopCycle(){
	if(stop_cycle)
		reset();
	else
		stop_cycle = true;
}

function cycle(){
	thisTime = performance.now();
	deltaTime = (thisTime - lastTime) * timeScale;
	redraw();
	lastTime = thisTime;
	if(!stop_cycle)
		window.requestAnimationFrame(cycle);
	else
		reset();
}

reset();