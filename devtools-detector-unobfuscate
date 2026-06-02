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
			this.setDetectDelay(500);
		}

		this._detectLoopStopped = false;
		this._detectLoop();
	}

	stop() {
		this._detectLoopStopped = true;
		this._isOpen = false;
		this._openCount = 0;
		clearTimeout(this._timer);
	}

	isLaunch() {
		return !this._detectLoopStopped;
	}

	setDetectDelay(delay) {
		this._detectLoopDelay = delay;
	}

	addListener(fn) {
		this._listeners.push(fn);
	}

	removeListener(fn) {
		this._listeners = this._listeners.filter(l => l !== fn);
	}

	_broadcast(payload) {
		this._listeners.forEach(listener => {
			try {
				listener(payload.isOpen, payload);
			} catch (e) {}
		});
	}

	async _detectLoop() {
		if (this._detectLoopStopped) return;

		if (document.hidden) {
			this._timer = setTimeout(() => this._detectLoop(), this._detectLoopDelay);
			return;
		}

		let detected = false;
		let checkerName = "";

		for (const checker of this._checkers) {
			if (await checker.isEnable()) {
				checkerName = checker.name;

				if (await checker.isOpen()) {
					detected = true;
					break;
				}
			}
		}

		if (detected) {
			this._openCount++;

			if (this._openCount >= 3 && !this._isOpen) {
				this._isOpen = true;
				this._broadcast({ isOpen: true, checkerName });
			}
		} else {
			this._openCount = 0;

			if (this._isOpen) {
				this._isOpen = false;
				this._broadcast({ isOpen: false, checkerName });
			}
		}

		this._timer = setTimeout(() => this._detectLoop(), this._detectLoopDelay);
	}
}

const debuggerChecker = {
	name: "debugger-checker",

	async isOpen() {
		const start = performance.now();

		try {
			(function () {}).constructor("debugger")();
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
			const t0 = performance.now();

			for (let i = 0; i < 100000; i++) {
				JSON.stringify({ index: i });
			}

			return performance.now() - t0;
		};

		const base = measure();
		const spike = measure();

		const max = Math.max(base, spike);

		if (!base) return false;

		return spike > 25 * base;
	},

	async isEnable() {
		return true;
	}
};

const erudaChecker = {
	name: "eruda-checker",

	async isOpen() {
		return typeof eruda !== "undefined" &&
					 eruda?._devTools?._isShow === true;
	},

	async isEnable() {
		return true;
	}
};

const vConsoleChecker = {
	name: "vConsole-checker",
	
	async isOpen() {
		
		if(typeof VConsole !== "undefined") return true;
		
		if(window.VConsole || window.vConsole) return true;
		
		if(document.getElementById('__vconsole')) return true;
		
		if(document.documentElement.classList.contains('vc-toggle')) return true;
		
		const scripts = [...document.scripts];
		const found = scripts.some(s => s.src.includes("vconsole"));
		if(found) return true;
		
		const nativeToString = Function.prototype.toString;
		if(!nativeToString.call(console.log).includes('[native code]')) return true;
	},
	
	async isEnable() {
		return true;
	}
};
