let width = 450;
let height = 450;
let margin = {top: 20, left: 30, right: 20, bottom: 20};
let scale = 100;

const DELAY = 5;
const cluster_quantity = 3;
const points_per_cluster = 50;
const epsilon = 50;
const min_dist_between_clusters = scale / cluster_quantity;

function generatePoints(clusters) {
	var clusters = [];
	var points = [];

	for (var k = 0; k < cluster_quantity; k++) {
		var tries = 0;
		var proposed_cluster;
		var max_distance;
		do {
			proposed_cluster = ({
					x1: scale*0.1 + Math.random() * (scale*0.8),
					x2: scale*0.1 + Math.random() * (scale*0.8)});
			max_distance = Math.max(clusters.map((f) => distance(f, proposed_cluster)));
			tries += 1;
		} while (max_distance < min_dist_between_clusters && tries < 200);

		let cluster = proposed_cluster;
		points.push(cluster);
		clusters.push(cluster);

		let dispersal = 50;
		for (var i = 0; i < points_per_cluster; i++) {
			var point = {x1: cluster.x1 + (randomGaussian() - 0.5) * dispersal,
						 x2: cluster.x2 + (randomGaussian() - 0.5) * dispersal,
						 cluster: k};
			points.push(point);
		}
	}

	return points;
}

function getInitialSolution() {
	var solution = [];
	for (var i = 0; i < cluster_quantity; i++) {
		solution.push({x1: 0, x2: 0});
	}
	return solution;
}

function pickRandomNeighbor(sol) {
	var sol_hat = deepCopy(sol);

	var idx = Math.round(Math.random() * (cluster_quantity - 1));
	var coord = Math.random() <= 0.5 ? 'x1' : 'x2';
	sol_hat[idx][coord] += (randomGaussian() - 0.5) * epsilon;

	return sol_hat;
}

function lossFunction(sol) {
	var total_distance = 0;
	for (var point of points) {
		var min_distance = 9999;

		for (var cluster of sol) {
			var dist = distance(cluster, point);

			if (dist <= min_distance) {
				min_distance = dist;
			}
		}

		total_distance += min_distance;
	}

	return total_distance / points.length;

	// return points.map((pt) => Math.min(...sol.map((k) => distance(k, pt))))
		// .reduce((a, b) => a + b) / points.length;
}

var max_iterations, T0, k_max;
var curr_action = [""]
var solution_min;
var inner_iter, outer_iter;

// function stepSimulatedAnnealing() {
// 	switch (curr_action) {
// 		case 0:
// 			max_iterations = 100;
// 			T0 = 10;
// 			k_max = 10;
// 			inner_iter = 0;
// 			outer_iter = 0;

// 			solution = getInitialSolution();
// 			solution_min = deepCopy(solution);

// 			curr_action += 1;
// 			break;
// 		case 1:
// 			if 
// 	}
// }

var states = ["PAUSED", "PLAY"];
var current_state = 0;

function waitForButton() {
	return new Promise((resolve) => {
		$("button").on('click', (e) => {
			var id = e.currentTarget.id;

			if (id == "play-btn" && current_state == 0) {
				current_state = 1;
				$("#play-btn").text("|| Pause");
			} else if (id == "play-btn" && current_state == 1) {
				current_state = 0;
				$("#play-btn").text(">> Play");
			}

			resolve();
		})
	});
}

let points = generatePoints();

var curr_line = -1;
var curr_line_state = 1;
var x, J_x;
var x_min, J_x_min;
var x_hat, J_x_hat;
var T;

async function runSimulatedAnnealing() {
	let max_iterations = 100;
	let k_max = 10;
	let J = lossFunction;

	curr_line = 0; curr_line_state = 1; updateUI(); updateSVG([], [], []);
	if (current_state == 0) { await waitForButton(); } else { await sleep(DELAY); }

	T0 = 1; T = undefined;
	x = getInitialSolution();
	J_x = J(x);
	x_min = deepCopy(x);
	J_x_min = J_x;

	curr_line = 1; curr_line_state = 1; updateUI(); updateSVG(x, [], x_min);
	$("#code-line-1-comment").text("#k = 1")
	if (current_state == 0) { await waitForButton(); } else { await sleep(DELAY); }
	$("#code-line-1-comment").text("")

	for (var k = 1; k <= k_max; k++) {
		curr_line = 2; curr_line_state = 1; updateUI();
		if (current_state == 0) { await waitForButton(); } else { await sleep(DELAY); }

		T = T0 / (Math.log(k + 1) / Math.log(2));
		// console.warn(`Updated temperature to ${T}.`)

		for (var n = 1; n <= max_iterations; n++) {
			curr_line = 3; curr_line_state = 1; updateUI();
			$("#code-line-3-comment").text(`#n = ${n}`)
			if (current_state == 0) { await waitForButton(); } else { await sleep(DELAY); }
			$("#code-line-3-comment").text("")

			curr_line = 4; curr_line_state = 1; updateUI(); 
			if (current_state == 0) { await waitForButton(); } else { await sleep(DELAY); }

			x_hat = pickRandomNeighbor(x);
			J_x_hat = J(x_hat)

			// console.log(`1. Generated new solution x_hat with J(x_hat) = ${J_x_hat}`)
			// console.log(`2. Current J(x) = ${J_x}`)
			// console.log(`   Threshold: ${Math.exp((J_x - J_x_hat) / T)}`)
			var random_val = Math.random();
			var should_accept_transition = (random_val <= Math.exp((J_x - J_x_hat) / T));

			curr_line = 5; curr_line_state = should_accept_transition ? 1 : 0; updateUI(); updateSVG(x, x_hat, x_min);
			$("#code-line-5-comment").text(`#${random_val.toFixed(3)} <= ${Math.exp((J_x - J_x_hat) / T).toFixed(3)}`)
			if (current_state == 0) { await waitForButton(); } else { await sleep(DELAY); }
			$("#code-line-5-comment").text("")

			if (should_accept_transition) {
				// console.log(`3. Accepted new solution x_hat.`)
				curr_line = 6; curr_line_state = 1; updateUI(); updateSVG(x, x_hat, x_min);
				if (current_state == 0) { await waitForButton(); } else { await sleep(DELAY); }

				x = x_hat;
				J_x = J_x_hat;
				
				curr_line = 7; curr_line_state = (J_x <= J_x_min) ? 1 : 0; updateUI(); updateSVG(x, [], x_min);
				$("#code-line-7-comment").text(`#${J_x.toFixed(3)} <= ${J_x_min.toFixed(3)}`)
				if (current_state == 0) { await waitForButton(); } else { await sleep(DELAY); }
				$("#code-line-7-comment").text("")

				if (J_x <= J_x_min) {
					curr_line = 8; curr_line_state = 1; updateUI();
					if (current_state == 0) { await waitForButton(); } else { await sleep(DELAY); }

					x_min = deepCopy(x);
					J_x_min = J_x

					updateSVG(x, x_hat, x_min);
					// console.log(`4. Updated best solution seen so far.`)
				}
			}

			x_hat = undefined; J_x_hat = undefined;
		}

		curr_line = 3; curr_line_state = 0; updateUI();
		$("#code-line-3-comment").text(`#n = ${max_iterations}`)
		if (current_state == 0) { await waitForButton(); } else { await sleep(DELAY); }
		$("#code-line-3-comment").text("")
	}

	curr_line = 1; curr_line_state = 0; updateUI();
	$("#code-line-1-comment").text(`#k = ${k_max}`)
	if (current_state == 0) { await waitForButton(); } else { await sleep(DELAY); }
	$("#code-line-1-comment").text("")

	console.log("Final solution is:")
	console.log(x_min)
}

let xScale = d3.scaleLinear().domain([0, scale]).range([margin.left, width - margin.left]);
let yScale = d3.scaleLinear().domain([0, scale]).range([height - margin.bottom, margin.bottom]);

let main_view = d3.selectAll("#main-view").attr("width", width).attr("height", height);

function updateSVG(solution, solution_hat, best_solution) {
	main_view
		.selectAll(".data-point")
		.data(points)
		.join(
			enter => {
				enter.append("circle")
					.classed("data-point", true)
					.attr("cx", pt => xScale(pt.x1))
					.attr("cy", pt => yScale(pt.x2))
					.attr("r", 5)
			}
		)

	main_view
		.selectAll(".solution-point")
		.data(solution)
		.join(
			enter => {
				enter.append("circle")
					.classed("solution-point", true)
					.attr("cx", pt => xScale(pt.x1))
					.attr("cy", pt => yScale(pt.x2))
					.attr("r", 5)
			},
			update => {
				update
					// .transition().duration(500)
					.attr("cx", pt => xScale(pt.x1))
					.attr("cy", pt => yScale(pt.x2))
			}
		)

	main_view
		.selectAll(".proposed-solution-point")
		.data(solution_hat)
		.join(
			enter => {
				enter.append("circle")
					.classed("proposed-solution-point", true)
					.attr("cx", pt => xScale(pt.x1))
					.attr("cy", pt => yScale(pt.x2))
					.attr("r", 5)
			},
			update => {
				update
					// .transition().duration(500)
					.attr("cx", pt => xScale(pt.x1))
					.attr("cy", pt => yScale(pt.x2))
			}
		)

	main_view
		.selectAll(".best-solution-point")
		.data(best_solution)
		.join(
			enter => {
				enter.append("svg:polygon")
					.classed("best-solution-point", true)
					.attr("points", pt => calculateStarPoints(xScale(pt.x1), yScale(pt.x2), 5, 10, 5, -90));
			},
			update => {
				update
					.attr("points", pt => calculateStarPoints(xScale(pt.x1), yScale(pt.x2), 5, 10, 5, -90));
			}
		)
}

function updateUI() {
	let pt2str = (x) => x ? x.map((pt, i) => `${i+1}: [${pt['x1'].toFixed(2)}, ${pt['x2'].toFixed(2)}]`).join("<br>") : "---"
	let default_pt_str = [...Array(cluster_quantity)].map((_) => "---").join("<br>")

	$("#table-values-T").text(T ? T.toFixed(5) : "---");
	$("#table-values-x").html(x ? pt2str(x) : default_pt_str);
	$("#table-values-Jx").text(J_x ? J_x.toFixed(3) : "---");
	$("#table-values-xhat").html(x_hat ? pt2str(x_hat) : default_pt_str);
	$("#table-values-Jxhat").text(J_x_hat ? J_x_hat.toFixed(3) : "---");
	$("#table-values-xmin").html(x_min ? pt2str(x_min) : default_pt_str);
	$("#table-values-Jxmin").text(J_x_min ? J_x_min.toFixed(3) : "---");

	$(".code-line").removeClass("successful-code");
	$(".code-line").removeClass("errorful-code");
	$(`#code-line-${curr_line}`).addClass(curr_line_state ? "successful-code" : "errorful-code");
}

let xAxis = main_view
	.append("g")
	.classed("axis", true)
	.call(d3.axisBottom(xScale))
	.attr("transform", `translate(0, ${height - margin.bottom})`)

let yAxis = main_view
	.append("g")
	.classed("axis", true)
	.call(d3.axisLeft(yScale))
	.attr("transform", `translate(${margin.left},0)`)

runSimulatedAnnealing();
// updateSVG();
