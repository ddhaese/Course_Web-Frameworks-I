# Web Frameworks Deel I (26543/1700/1920/1/00)

## Promises and Workers

### The NLP Case Study

In web development practice, you will frequently encounter asynchronous calls. A function call is asynchronous when you do not want to wait for the function to return a value. To be more precise: promises are useful whenever you are interested in the return value, but you do not want to wait for it. You want to continue with your regular work and let the Javascript engine pick up at a certain point in the script whenever the function returns. Let us consider an example. Suppose you want to have a web application subject text to a NLP algorithm thats extracts entities from it:

![Asynchronous NLP example](Media/NLP.png)

You start off with a piece of text (shown on the far left). To analyze it, you could choose either to develop your own algorithm using some external library or use an external API. Either way, you would want to follow these steps:

1. Do some pre-processing of the text (remove punctuation)
2. Break the text down into smaller parts (here paragraphs)
3. Send all the parts *in parallel* (i.e. simultaneously) to the algorithm
4. Wait for the last result to arrive (here, the return value is a set of entties)
5. Join the results (i.e. create a list of unique entities and their frequency of occurrence)

### Introduction to promises

So promises are the answer to solve the previously described situation of delayed or asynchronous workload. One can regard a promise as a wrapper around a regular function that adds state to that function. Here are the states in which a promise can find itself:

- **pending**: not yet completed
- **fulfilled**: completed successfully
- **rejected**: completed with an error

Instead of *completed* we use the term **settled**.

### Pretend Multi-threaded

Unlike other (some would argue *real*) programming languages, the main JavaScript thread of a web application is designed to be single threaded, not multi-threaded. This means that JavaScript

- only has one call stack and one memory heap
- cannot programmatically manage multiple threads running scripts independently and simultaneously
- must finish a piece of code before moving on to the next

One well-known and simple example of the single-threaded nature of JavaScript is the `Hello World` alert:

```js
alert("Hello world!")
```

which blocks the execution of the main thread until the user hits the `OK` button.

How is it even possible to work with events if JavaScript is truly single-threaded? And to return to the current topic, how can we have promises in a single-threaded scripting language? Well, whenever the JavaScript engine (including SpiderMonkey, JavaScriptCore and V8) encounters code that needs to be treated asynchronously such as an *DOM event* (`onClick`, `onbeforeinstallprompt`, &hellip;), a `setTimeout`, an *ajax* call or the like, it does not immediately runs the code, but instead pushes it off to the corresponding Web API of the browser. Whenever the Web API decides that the callback needs to be executed (i.e. upon firing the event, after n milliseconds or upon return from the ajax call) it pushes the callback onto the message queue where it is being handled by the event loop. The event loop watches the stack and the message queue and pushes the next task onto the stack once the stack gets empty. See [this video](http://latentflip.com/loupe/?code=JC5vbignYnV0dG9uJywgJ2NsaWNrJywgZnVuY3Rpb24gb25DbGljaygpIHsKICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gdGltZXIoKSB7CiAgICAgICAgY29uc29sZS5sb2coJ1lvdSBjbGlja2VkIHRoZSBidXR0b24hJyk7ICAgIAogICAgfSwgMjAwMCk7Cn0pOwoKY29uc29sZS5sb2coIkhpISIpOwoKc2V0VGltZW91dChmdW5jdGlvbiB0aW1lb3V0KCkgewogICAgY29uc29sZS5sb2coIkNsaWNrIHRoZSBidXR0b24hIik7Cn0sIDUwMDApOwoKY29uc29sZS5sb2coIldlbGNvbWUgdG8gbG91cGUuIik7!!!PGJ1dHRvbj5DbGljayBtZSE8L2J1dHRvbj4%3D) and play around with the Loupe	application written by Philip Roberts.

> Differences between promises and events:
>
> While an event can fire multiple time, a promise can only settle once
>
> A `resolve` or `reject` callback that has been added to a promise after it has already settled will still appropriately be executed

So with the JavaScript engine being single threaded, there won't be any parallel computing possible, right? Well, with the invent of web workers, this is no longer true, but more on that topic later.

### Initializing a Promise

You can initialize a promise through the `Promise` interface:

```js
const DANDELION_ENT_URL = "https://api.dandelion.eu/datatxt/nex/v1";


const ajax = (resolve, reject) => {
	const xhr = new XMLHttpRequest();
	const url = new URL(DANDELION_ENT_URL);

	xhr.open("GET", url);
	xhr.onload = () => resolve({ id, resp: xhr.responseText });
	xhr.onerror = () => reject({ id, stat: xhr.statusText });
	xhr.send();
}

const ajaxPromise = new Promise(ajax);
```

Here, `ajax` is called the executor function. Executor functions should always accept two function arguments. One (`resolve`) is the function to be return to whenever the operation was successful, the other (`reject`) when is was unsuccessful. These two settlement functions (`resolve` and `reject`) *replace* the standard `return` clause of a function to separate the positive from the negative flow.

### Wrapping Promises

The executor function takes on the two callbacks, but nothing else. In order to have a proper function, you would want to have more input arguments, right? To achieve that, you can wrap the promise inside another function. Let us apply this idea to the use case introduced above.

```js
const DANDELION_ENT_URL = "https://api.dandelion.eu/datatxt/nex/v1";

const processParagraph = (paragraph, index) => {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		const url = new URL(DANDELION_ENT_URL);
		url.searchParams.set("text", paragraph);
		url.searchParams.set("lang", "en");
		url.searchParams.set("include", "types,categories");
		url.searchParams.set("token", "YOUR TOKEN HERE");

		xhr.open("GET", url);
		xhr.onload = () => resolve({ index, resp: xhr.responseText });
		xhr.onerror = () => reject({ index, stat: xhr.statusText });
		xhr.send();
	});
};
```

So the wrapper function `processParagraph` takes on the necessary arguments and, within its scope defines a promise that can consume these arguments.  The input arguments are the `paragraph` for which the entities need to be extracted and the index of the paragraph. The executor function of the promise is written inline and forms a wrapper around JavaScript's `XMLHttpRequest` class and corresponding `send` method. Notice that the executor function does not have any `return` clause, but uses the `resolve` and `reject` callbacks instead.

### Executing a promise

What happens if you run the above code in your browser's development tools, followed by a call to `processParagraph`?

```js
processParagraph("This is a test paragraph", 0)
```

This is what you would see *eventually* in case you switched off the internet on your machine:

![Calling a promise](Media/NLP_No_Game.png)

I say *eventually*, because the `Promise (pending)` message appears immediately, but the error messages appear only after a few seconds! What does it mean? It means that the promise did exactly what it was meant to do, namely execute the code but do not let anyone wait for the results. After executing the above statement, the call to `resolve` or `reject` is being delayed until the JavaScript engine becomes idle. So you could regard the settlement functions as delayed returned clauses.

Let us test this idea by running the following code directly in the developer tools:

```js
const startTime = performance.now();
let diffTime = performance.now() - startTime;
console.log (`Start script: ${diffTime} ms`);

const test = (input) => {
	diffTime = performance.now() - startTime;
	console.log (`Start wrapper: ${diffTime} ms`);

	return new Promise((resolve, reject) => {
		diffTime = performance.now() - startTime;
		console.log (`Start executor: ${diffTime} ms`);

		resolve (input)
	});
};


diffTime = performance.now() - startTime;
console.log (`Start Execution: ${diffTime} ms`);

test(0);

diffTime = performance.now() - startTime;
console.log (`End script: ${diffTime} ms`);
```

Here is the screenshot showing the result:

![Timing of promise without then](Media/NLP_Timing1.png)

Oops, what happened? No delay to be seen! The engine executed all the bits in the natural order. This is where many people get lost: the executor function is immediately started, it is the call to the settlement functions that is being delayed, not the execution of the executor function itself! In other words: the engine immediately start executing the asynchronous code but really only goes asynchronous whenever it needs to do so.

### Providing the resolve and reject callbacks

The settlement callbacks can be provided using the `then` respectively `catch` methods of the Promise interface:

```js
const divideAsync = (a, b) => {
	return new Promise((resolve, reject) => {
		if (b === 0) {
			reject("I won't divide by zero.");
		} else {
			resolve(a / b);
		}
	});
};

[3, 0].forEach(divisor => {
	divideAsync(2, divisor)
		.then(res => {
			console.log(res);
		})
		.catch(err => {
			console.error(err);
		});
});
```

As expected, you would get this result:

![Then and Catch](Media/Promise_Timing_3.png)

Notice that this syntax allows for *chaining* multiple `then` clauses, as long as they return a promise themselves:

```js
getUserByEmail(email)
	.then(user => {
		return getCompanyByUser(user);
	})
	.then(company => {
		return getSupplyChainByCompany(company);
	})
	.then(supplyChain => {
		draw(supplyChain);
	})
	.catch(err => {
		console.error(err);
	});
```

The catch clause at the end will catch *any error* that occurred anywhere in the chain. If we now adjust the above call to the `test` wrapper function and include a `then`, we get the following:

```js
const startTime = performance.now();
let diffTime = performance.now() - startTime;
console.log (`Start script: ${diffTime} ms`);

const test = (input) => {
	diffTime = performance.now() - startTime;
	console.log (`Start wrapper: ${diffTime} ms`);

	return new Promise((resolve, reject) => {
		diffTime = performance.now() - startTime;
		console.log (`Start executor: ${diffTime} ms`);

		resolve (input)
	});
};


diffTime = performance.now() - startTime;
console.log (`Start Execution: ${diffTime} ms`);

test(0).then(input =>{
	diffTime = performance.now() - startTime;
	console.log (`Returning input ${input}: ${diffTime} ms`);
});

diffTime = performance.now() - startTime;
console.log (`End script: ${diffTime} ms`);
```

Now, we see that the callback is being delayed, even though no real async code is being presented.

![Timing of promise with then](Media/NLP_Timing2.png)

### Async and await

There exists an alternative for the above chaining syntax:

```js
const getSupplyChainByEmail = async email => {
	try {
		const user = await getUserByEmail(email);
		const company = await getCompanyByUser(user);
		const supplyChain = await getSupplyChainByCompany(company);

		draw(supplyChain);
	} catch {
		console.error(err);
	}
};
```

Notice that the code is a more elegant, but it requires the use of a wrapper function that itself is being turned into a promise by way of the `async` keyword.

### Web workers

As promised, I would like to add a few words on Web workers. With Moore's law dying, multi-core architecture taking over the world, web application taking on more responsibilities and JavaScript becoming increasingly popular everywhere (backend, frontend, IoT devices, &hellip;) there was a need to allow for parallel computing inside and outside the browser.

Let us consider the following case:

```js
for (let i = 0;  i< 100000; i++){
	// do stuff
}
```

The goal of parallelisation would be to divide the above workload into smaller chunks that run on parallel processors. Remember that approaching this with the `setTimeout (..., 0)` trick would still have the code run with the same thread, albeit allowing the browser to perform some rendering in between the chunks:

```js
for (let i = 0;  i< 100; i++){
	setTimeout (() => {
		for (let j = 0;  j< 1000; j++){
			// do stuff
		}
	}, 0);
}
```

So, we need something better and thanks to the HTML5 specification of the Web Worker API we can now achieve true parallelism, i.e. utilize multiple cores. Be warned though:

- Web workers are meant for heavy-weight lifting only
- They are slow to start up and require a lot of cpu overhead
- Web workers require a lot of memory
- Web workers are isolated and have a separate memory, message queue and event loop
- They cannot access the DOM and the common JS functions and thus cannot interfere with the user interface directly (ajax calls are possible!)
- They must be controlled through messages much like the messages conveying the callbacks in the message queue described above

![Inner working of the web workers](http://madhugnadig.com/articles/images/web-workers.png)

### Creating a new Web Worker

Here is the main JavaScript cipher

```js - main.js
function compute(){
	if (!Worker) throw "Cannot do serious work in this crappy browser! Goodbye.";

	let worker = new Worker("task.js");

	worker.postMessage(input);

	worker.onmessage = event => {
		console.log(event.data);
	};
}
```

And here is how the worker looks like:

```js - task.js
isolatedTask = input => {
  const result =  heavyLiftingHere();
  // The way to return to the main thread of the JavaScript Engine:
  postMessage(result);
}
```

### Completing the story: Parallel web workers

All we are left to do is to create multiple web workers to achieve parallelism. Refactoring the previous generic code (not tested):

```js - task.js
isolatedTask = (index, input) => {
	let resultChunk = [];

	for (let i = 0;  i< 1000; i++){
		resultChunk [i] = doHeavyStuff();
	}

	postMessage({result: resultChunk, index});
}
```

```js
function compute(){
	if (!Worker) throw "Cannot do serious work in this crappy browser! Goodbye.";

	let results = [];
		
	for (let i = 0; i<100; i++){
		let worker = new Worker("task.js");

		worker.postMessage(i, "dummyInput");

		worker.onmessage = event => {
			results[event.data.index] = event.data.result;
		};
	}

	return results;
}
```

Here is an example of the speedup achieved by using web workers:

| Number of Data points | Serial    | Parallel | Speedup |
| --------------------- | --------- | -------- | ------- |
| 400                   | 9.165000  | 1.855000 | 4.9407  |
| 800                   | 11.10500  | 1.225000 | 9.0653  |
| 1600                  | 20.099999 | 3.545000 | 5.6699  |
| 3200                  | 45.905000 | 4.929999 | 9.3113  |
| 6400                  | 93.797550 | 5.265000 | 17.8153 |
| 12800                 | 288.005   | 9.44499  | 30.4298 |
[Source](http://madhugnadig.com/articles/parallel-processing/2017/03/29/the-guide-to-parallel-programming-in-javascript.html)

Be careful to monitor memory usage, though!

Happy coding!
