class DevtoolsDetector {
	constructor({ checkers = [], detectDelay = 500 } = {}) {
		this._checkers = checkers;
		this._listeners = [];
		this._isOpen = false;
		this._detectLoopStopped = true;
		this._detectLoopDelay = detectDelay;
		this._timer = null;

		this._openCount = 0;
	}

	get isOpen() {
		return this._isOpen;
	}

	launch() {
		if (!this._detectLoopStopped) return;

		if (this._detectLoopDelay <= 0) {
			this._detectLoopDelay = 500;
		}

		this._detectLoopStopped = false;
		this._detectLoop();
	}

	stop() {
		this._detectLoopStopped = true;
		this._isOpen = false;
		this._openCount = 0;

		clearTimeout(this._timer);
		this._timer = null;
	}

	isLaunch() {
		return !this._detectLoopStopped;
	}

	setDetectDelay(delay) {
		this._detectLoopDelay = delay;
	}

	addListener(fn) {
		if (typeof fn === "function") {
			this._listeners.push(fn);
		}
	}

	removeListener(fn) {
		this._listeners = this._listeners.filter(listener => listener !== fn);
	}

	_broadcast(payload) {
		this._listeners.forEach(listener => {
			try {
				listener(payload.isOpen, payload);
			} catch (e) {
				// 개발 중 필요하면 사용
				// console.error(e);
			}
		});
	}

	async _detectLoop() {
		if (this._detectLoopStopped) {
			return;
		}

		if (document.hidden) {
			this._openCount = 0;

			this._timer = setTimeout(() => {
				this._detectLoop();
			}, this._detectLoopDelay);

			return;
		}

		let detected = false;
		let checkerName = "";

		for (const checker of this._checkers) {
			if (!(await checker.isEnable())) {
				continue;
			}

			if (await checker.isOpen()) {
				detected = true;
				checkerName = checker.name;
				break;
			}
		}

		if (detected) {
			this._openCount++;

			if (!this._isOpen && this._openCount >= 3) {
				this._isOpen = true;

				this._broadcast({
					isOpen: true,
					checkerName
				});
			}
		} else {
			this._openCount = 0;

			if (this._isOpen) {
				this._isOpen = false;

				this._broadcast({
					isOpen: false,
					checkerName: ""
				});
			}
		}

		this._timer = setTimeout(() => {
			this._detectLoop();
		}, this._detectLoopDelay);
	}
}

const debuggerChecker = {
	name: "debugger-checker",

	async isOpen() {
		const start = performance.now();

		try {
			debugger;
		} catch (e) {}

		return performance.now() - start > 300;
	},

	async isEnable() {
		return true;
	}
};

const performanceChecker = {
	name: "performance-checker",

	async isOpen() {
		const measure = () => {
			const start = performance.now();

			for (let i = 0; i < 100000; i++) {
				JSON.stringify({ index: i });
			}

			return performance.now() - start;
		};

		const first = measure();
		const second = measure();

		if (first <= 0) {
			return false;
		}

		// 참고용 신호로만 사용
		return second > first * 10 && (second - first) > 100;
	},

	async isEnable() {
		return true;
	}
};

const erudaChecker = {
	name: "eruda-checker",

	async isOpen() {
		return (
			typeof window.eruda !== "undefined" &&
			window.eruda?._devTools?._isShow === true
		);
	},

	async isEnable() {
		return true;
	}
};

const vConsoleChecker = {
	name: "vConsole-checker",

	async isOpen() {
		if (typeof VConsole !== "undefined") {
			return true;
		}

		if (window.VConsole || window.vConsole) {
			return true;
		}

		if (document.getElementById("__vconsole")) {
			return true;
		}

		const scripts = Array.from(document.scripts);

		if (scripts.some(script => script.src.includes("vconsole"))) {
			return true;
		}
		/*
		네이티브 코드 flutter vue react 오탐 가능.
		const nativeToString = Function.prototype.toString;
		if (
			!nativeToString
				.call(console.log)
				.includes("[native code]")
		) {
			return true;
		}
		*/

		return false;
	},

	async isEnable() {
		return true;
	}
};

// 사용 예시
/*const detector = new DevtoolsDetector({
	detectDelay: 500,
	checkers: [
		debuggerChecker,
		performanceChecker,
		erudaChecker,
		vConsoleChecker
	]
});

detector.addListener((isOpen, payload) => {
	console.log("DevTools:", isOpen ? "OPEN" : "CLOSE", payload);*/
});

detector.launch();
