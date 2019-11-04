function workerCode() {
	var pi = 0;
	this.addEventListener("message", function(event) {
		switch (event.data) {
			case "start":
				computePiAsync();
				break;
			case "update":
				postMessage(pi);
				break;
			case "stop":
				close();
				break;
		}
	});

	function computePiAsync() {
		var computePi = genComputePi();
		function resume() {
			pi = computePi.next();
			if (!pi.done) setTimeout(resume, 0);
			if (pi.done) postMessage(pi);
			return;
		}
		setTimeout(resume, 0);
		return;
	}

	function* genComputePi() {
		var k;
		var pi = 0;
		for (k = 1; k <= 1000000; k++) {
			pi += (4 * Math.pow(-1, k + 1)) / (2 * k - 1);
			if (Math.trunc(k / 1000) * 1000 === k) yield pi;
		}
		return pi;
	}
}

var workerCodeString = "(" + workerCode.toString() + ")()";
var blob = new Blob([workerCodeString], { type: "application/javascript" });
var url = URL.createObjectURL(blob);

var worker = new Worker(url);

worker.addEventListener("message", function(event) {
	result.innerHTML = event.data.value.toFixed(15);
});

const start = () => {
	worker.postMessage("start");
	setInterval(function() {
		worker.postMessage("update");
	}, 100);
};
