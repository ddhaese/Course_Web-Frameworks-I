const DANDELION_ENT_URL = "https://api.dandelion.eu/datatxt/nex/v1";
let startTime = null;

const getRandomColor = () => {
	const letters = "0123456789ABCDEF";
	const color =
		"#" +
		Array(6)
			.fill(true)
			.map(e => letters[Math.floor(Math.random() * 16)])
			.join("");
	return color;
};

const processParagraph = (paragraph, index) => {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		const url = new URL(DANDELION_ENT_URL);
		url.searchParams.set("text", paragraph);
		url.searchParams.set("lang", "en");
		url.searchParams.set("include", "types,categories");
		url.searchParams.set("token", "<yourtokenhere>");

		xhr.open("GET", url);
		xhr.onload = () => resolve({ index, resp: xhr.responseText });
		xhr.onerror = () => reject({ index, stat: xhr.statusText });
		xhr.send();
	}).then(({ index, resp }) => {
		paragraphSuccess(index);
		const timeDiff = performance.now() - startTime;
		console.log(
			`Successfully extracted entities for paragraph ${index} in ${timeDiff} milliseconds`
		);
		return JSON.parse(resp);
	});
};

paragraphSuccess = index => {
	const par = document.getElementById("par-viewer").children[index];
	par.classList.add("success");
};

summarizeResults = resultArray => {
	let wordCounts = {};

	const addWord = word => {
		if (!wordCounts[word]) {
			wordCounts[word] = 1;
		} else {
			wordCounts[word]++;
		}
	};

	resultArray.forEach(res => res.annotations.forEach(ann => addWord(ann.label)));

	const sortByKeyAndFrequency = (a, b) => {
		if (a[1] < b[1]) {
			return 1;
		}
		if (a[1] > b[1]) {
			return -1;
		}
		if (a[0] < b[0]) {
			return -1;
		}
		if (a[0] > b[0]) {
			return 1;
		}

		return 0;
	};

	const wordCountsSorted = Object.entries(wordCounts).sort(
		sortByKeyAndFrequency
	);

	Object.entries(wordCountsSorted).forEach(([index, item]) => {
		const entry = `${item[0]} (${item[1]})`;
		const entryListItem = document.createElement("li");
		entryListItem.innerHTML = entry;
		const summaryList = document.getElementById("summary");
		summaryList.appendChild(entryListItem);
	});
};

reportErrors = error => {
	console.error(error);
};

const processText = e => {
	startTime = performance.now();

	const inputForm = document.getElementById("input");
	const parViewer = document.getElementById("par-viewer");

	parViewer.innerHTML = "";

	const corpus = inputForm.elements["text"].value;
	const clean = text => {
		if (text.length === 0) return "";

		let newText = text
			.trim()
			.toLowerCase()
			.replace(/[^a-z\n]/g, " ")
			.replace(/\s\s+/g, " ");

		return newText;
	};

	const paragraphs = corpus
		.split("\n")
		.map(clean)
		.filter(p => p.length > 250);
	const parLengths = paragraphs.map(p => p.length);
	const totLength = parLengths.reduce((a, b) => a + b);

	parLengths.forEach(l => {
		const par = document.createElement("div");
		const randColor = getRandomColor();
		const blockHeight = Math.floor((500 * l) / totLength - 8);
		par.className = "par";
		par.style = `background-color:${randColor};height:${blockHeight}px;`;
		parViewer.appendChild(par);
	});

	const processingTasks = paragraphs.map(processParagraph);

	Promise.all(processingTasks)
		.then(summarizeResults)
		.catch(reportErrors);
};
