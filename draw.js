function drawFloor(){
	ctx.beginPath();
	ctx.moveTo(50, 600);
	ctx.lineTo(960, 600);	
	ctx.stroke();

	for (let i = 0; i < 22; ++i) {
      ctx.beginPath();
      ctx.moveTo(60 + i * 40, 640);
      ctx.lineTo(100 + i * 40, 600);
      ctx.stroke();
    }
}

function drawValve(){
	if (valve_state){
		ctx.beginPath();
		ctx.moveTo(252.1, 61);
		ctx.lineTo(259, 57);
		ctx.stroke();
	}
	else{
		ctx.beginPath();
		ctx.moveTo(259,65);
		ctx.lineTo(259,57);
		ctx.stroke();
	}

}

function drawBottle(){
	/*Bottom part*/
	ctx.beginPath();
	ctx.moveTo(150,120);
	ctx.lineTo(150,580);
	ctx.arcTo(150, 600, 170, 600, 20);
	ctx.lineTo(380,600);
	ctx.arcTo(400,600,400,580,20);
	ctx.lineTo(400,120);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(170,120,20,Math.PI, 1.333*Math.PI);
	ctx.lineTo(255,80);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(295,80);
	ctx.arc(380,120,20,1.667*Math.PI, 2*Math.PI);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(249,71,10, 0.333*Math.PI, 0, true);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(301,71,10, 0.667*Math.PI, Math.PI);
	ctx.stroke();

	/*Top part*/
	ctx.beginPath();
	ctx.moveTo(284 - 25,71);
	ctx.lineTo(284 - 25,65);
	ctx.moveTo(284 - 25,57);
	ctx.lineTo(284 - 25,50);
	ctx.lineTo(297 - 25,50);
	ctx.moveTo(303 - 25,50);
	ctx.lineTo(316 - 25,50);
	ctx.lineTo(316 - 25,57);
	ctx.moveTo(316 - 25,65);
	ctx.lineTo(316 - 25,71);
	ctx.stroke();
}

function drawRuler(){
	ctx.rect(660, -100, 80, 700);
	ctx.stroke();

	ctx.font="14px Segoe UI";
	for(let i = 0; i <= ruler_h; i++){
			ctx.lineWidth = 0.5;
		let y = i * 450 / ruler_h;
		ctx.beginPath();
		ctx.moveTo(660, 450 - y);
		if(i % 10 == 0){
			ctx.lineWidth = 1;
			ctx.lineTo(680, 450 - y);
			ctx.fillText("" + i / 10, 685, 453 - y);
		}
		else if(i % 5 == 0)
			ctx.lineTo(675, 450 - y);
		else
			ctx.lineTo(670, 450 - y);
		ctx.stroke();
	}
	ctx.lineWidth = 1;
	
}

function drawStick(){
	ctx.beginPath();
	ctx.rect(920, -100, 10, 700);
	ctx.stroke();


	ctx.fillStyle="#FFFFFF";
	ctx.beginPath();
	//ctx.rect(750, 320 - ballast_h, 190, 10);
	ctx.moveTo(755, 320 - ballast_h);
	ctx.lineTo(935, 320 - ballast_h);
	ctx.arc(935, 325 - ballast_h, 5, 1.5*Math.PI, 0.5*Math.PI);
	ctx.lineTo(760, 330 - ballast_h);
	ctx.arc(755, 325 - ballast_h, 5, 0.5*Math.PI, 1.5*Math.PI);
	ctx.fill();
	ctx.stroke();
	ctx.fillStyle="#000000";
}

function drawStraw(){
	ctx.beginPath();
	ctx.moveTo(290,57);
	ctx.lineTo(340,57);
	ctx.bezierCurveTo(420, 57, 420, -100, 540, -100);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(290,65);
	ctx.lineTo(340,65);
	ctx.bezierCurveTo(428, 65, 428, -92, 540, -92);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(540, 0, 100, 1.5*Math.PI, 2*Math.PI);
	ctx.lineTo(640, 450);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(540, 0, 92, 1.5*Math.PI, 2*Math.PI);
	ctx.lineTo(632, 450);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(732, 450, 100, Math.PI, 2*Math.PI, true);
	ctx.lineTo(832, 450 - ballast_h);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(732, 450, 92, Math.PI, 2*Math.PI, true);
	ctx.lineTo(824, 450 - ballast_h);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(832, 450 - ballast_h);
	ctx.lineTo(832 + 50, 450 - ballast_h);
	ctx.lineTo(832 + 50, 300 - ballast_h);
	ctx.lineTo(824 - 50, 300 - ballast_h);
	ctx.lineTo(824 - 50, 450 - ballast_h);
	ctx.lineTo(824, 450 - ballast_h);
	ctx.stroke();
}

function drawBulb(){
	let bulb_gate_r = 150;
	
	let bulb_gate_theta = Math.PI * 0.333 * (1 - bulb_close_degree) + Math.PI * 0.5 * bulb_close_degree; 

	ctx.beginPath();
	ctx.moveTo(265, 50);
	ctx.lineTo(265 - bulb_gate_r * Math.cos(bulb_gate_theta),50 - bulb_gate_r * Math.sin(bulb_gate_theta));
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(285, 50);
	ctx.lineTo(285 + bulb_gate_r * Math.cos(bulb_gate_theta),50 - bulb_gate_r * Math.sin(bulb_gate_theta));
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
		ctx.arc(275, -40, 50, 1.5*Math.PI - phi, 1.5*Math.PI + phi);
		ctx.stroke();	

		ctx.beginPath();
		ctx.moveTo(279, 50);
		ctx.quadraticCurveTo(278, 18, Math.min(298, 285 + 46 / t), 4);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(271, 50);
		ctx.quadraticCurveTo(272, 18, Math.max(252, 265 - 46 / t), 4);
		ctx.stroke();

		if(bulb_close_degree < 0.45){
			ctx.beginPath();
			ctx.arc(275, -40, 50, 0.5*Math.PI + beta, 0.65*Math.PI, true);
			ctx.stroke();

			ctx.beginPath();
			ctx.arc(275, -40, 50, 0.5*Math.PI - beta, 0.35*Math.PI);
			ctx.stroke();
		}
	}
	else{

		ctx.beginPath();
		ctx.arc(275, -40, 50, 0.35*Math.PI, 0.65*Math.PI, true);
		ctx.stroke();	


		ctx.beginPath();
		ctx.moveTo(279, 50);
		ctx.quadraticCurveTo(278, 18, 298, 4);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(271, 50);
		ctx.quadraticCurveTo(272, 18, 252, 4);
		ctx.stroke();

	}
}

function drawWater(){
	let arc_water_alpha = 0;
	if(water_h > 450)
		water_h = 450;
	if(water_h < 0){
		arc_water_alpha = -water_h / 96;
		water_h = 0;
	}
	
	ctx.lineWidth = 6;
	ctx.strokeStyle="#0099FF";

	ctx.beginPath();
	ctx.moveTo(636, 450 - water_h);
	ctx.lineTo(636, 450);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(636 + 96,450, 96, Math.PI - arc_water_alpha, 2*Math.PI, true);
	ctx.lineTo(828, 450 - ballast_h - 1);
	ctx.stroke();

	ctx.fillStyle="#0099FF";
	ctx.fillRect(775, 450 - ballast_h - ballast_water_h, 106, ballast_water_h - 1);

	ctx.fillStyle="#000000";

	ctx.lineWidth = 1;
	ctx.strokeStyle="#000000";

}

function drawDash(){
	if(!lab_mode)
		my = 650 - water_h;
	if(draw_dash){
		ctx.beginPath(); 
		ctx.setLineDash([15, 15]);
		ctx.moveTo(660, my - 200);
		ctx.lineTo(540, my - 200);
		ctx.stroke();
		ctx.beginPath();
		ctx.setLineDash([]);
		ctx.moveTo(555, my - 200);
		ctx.lineTo(525, my - 200);
		ctx.stroke();
		ctx.font="14px Segoe UI";
		ctx.textAlign="end";
		ctx.fillText(Math.round((650 - my) / (450/ruler_h)) + " мм", 570, my - 205);
	}
}

function redraw(){
	ctx.clearRect(0, 0, 1200, 800);
	ctx.save();
	ctx.translate(startx, starty);
	drawFloor();
	drawBottle();
	drawValve();
	drawStraw();
	drawRuler();
	drawBulb();
	drawWater();
	drawStick();
	drawDash();
	ctx.restore();
}