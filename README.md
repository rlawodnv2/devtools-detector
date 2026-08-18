<h1>Devtools Detector</h1>

<p>
A lightweight JavaScript library for detecting browser Developer Tools (DevTools)
and mobile debugging consoles.
</p>

<p><strong>Supported detection methods:</strong></p>
<ul>
    <li>Debugger execution delay detection</li>
    <li>Performance spike detection</li>
    <li>Eruda detection</li>
    <li>vConsole detection</li>
</ul>

<hr>

<h2>Features</h2>

<ul>
    <li>Pure JavaScript</li>
    <li>Modular checker architecture</li>
    <li>Event listener support</li>
    <li>Configurable detection interval</li>
    <li>False-positive reduction through consecutive detection validation</li>
    <li>Mobile debugging tool detection (Eruda, vConsole)</li>
</ul>

<hr>

<h2>Installation</h2>

<p>Include the script in your project:</p>

<pre><code>&lt;script src="devtools-detector.js"&gt;&lt;/script&gt;
</code></pre>

<hr>

<h2>Quick Start</h2>

<h3>Create Detector Instance</h3>

<pre><code>const detector = new DevtoolsDetector({
    checkers: [
        debuggerChecker,
        performanceChecker,
        erudaChecker,
        vConsoleChecker
    ],
    detectDelay: 500
});
</code></pre>

<h3>Start Detection</h3>

<pre><code>detector.launch();
</code></pre>

<h3>Stop Detection</h3>

<pre><code>detector.stop();
</code></pre>

<h3>Check Current Status</h3>

<pre><code>detector.isOpen;
</code></pre>

<h3>Check Whether Detector Is Running</h3>

<pre><code>detector.isLaunch();
</code></pre>

<hr>

<h2>Event Listeners</h2>

<p>Register a listener to receive DevTools state changes.</p>

<pre><code>detector.addListener((isOpen, payload) =&gt; {
    console.log("DevTools Open:", isOpen);
    console.log("Detected By:", payload.checkerName);
});
</code></pre>

<p><strong>Event Payload Example</strong></p>

<pre><code>{
    isOpen: true,
    checkerName: "debugger-checker"
}
</code></pre>

<hr>

<h2>Built-in Checkers</h2>

<h3>1. Debugger Checker</h3>

<p>
Detects DevTools by measuring the execution delay caused by the
<code>debugger</code> statement.
</p>

<pre><code>(function () {}).constructor("debugger")();
</code></pre>

<p>
If execution takes longer than 300ms, DevTools is considered open.
</p>

<h3>2. Performance Checker</h3>

<p>
Detects abnormal performance spikes that may occur while DevTools are active.
</p>

<pre><code>JSON.stringify({ index: i });
</code></pre>

<p>
A significant spike relative to the baseline indicates a potential
DevTools session.
</p>

<h3>3. Eruda Checker</h3>

<p>
Detects the presence of Eruda, a popular mobile debugging console.
</p>

<pre><code>typeof eruda !== "undefined"
</code></pre>

<pre><code>eruda?._devTools?._isShow === true
</code></pre>

<h3>4. vConsole Checker</h3>

## Warning

The `vConsoleChecker` may generate false positives in certain environments.

Applications built with frameworks such as **React Native** and **Flutter WebView** often wrap or override native console methods internally.

Because `vConsoleChecker` performs console integrity checks using:

```javascript
Function.prototype.toString.call(console.log)
```

these framework-level modifications may be mistakenly identified as debugging tools.

### Affected Environments

- React Native
- Flutter WebView
- Hybrid mobile applications
- Custom console wrappers

### Recommendation

If your application is running inside one of these environments, consider:

- Disabling `vConsoleChecker`
- Removing the console-hook detection logic
- Implementing a platform-specific checker

This behavior is expected and does not necessarily indicate that vConsole is installed.


<p>
Detects Tencent's vConsole debugging tool.
</p>

<p>Checks for:</p>

<ul>
    <li>VConsole</li>
    <li>window.VConsole</li>
    <li>window.vConsole</li>
    <li>#__vconsole</li>
    <li>Loaded vConsole scripts</li>
    <li>Console method hooking</li>
</ul>

<pre><code>document.getElementById("__vconsole")
</code></pre>

<pre><code>window.vConsole
</code></pre>

<hr>

<h2>Custom Checker</h2>

<p>
You can create your own checker by implementing the following interface:
</p>

<pre><code>const customChecker = {
    name: "custom-checker",

    async isOpen() {
        return true;
    },

    async isEnable() {
        return true;
    }
};
</code></pre>

<table border="1" cellpadding="6" cellspacing="0">
    <thead>
        <tr>
            <th>Method</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>name</td>
            <td>Checker identifier</td>
        </tr>
        <tr>
            <td>isOpen()</td>
            <td>Returns whether DevTools are detected</td>
        </tr>
        <tr>
            <td>isEnable()</td>
            <td>Returns whether the checker should run</td>
        </tr>
    </tbody>
</table>

<hr>

<h2>Detection Strategy</h2>

<p>
To reduce false positives, DevTools are not considered open immediately after a
single detection.
</p>

<pre><code>if (this._openCount >= 3)
</code></pre>

<p>
The detector requires three consecutive positive detections before triggering
the open state.
</p>

<ul>
    <li>Reduced false positives</li>
    <li>Improved stability</li>
    <li>Better resistance to temporary performance fluctuations</li>
</ul>

<hr>

<h2>Configuration</h2>

<h3>Detection Interval</h3>

<pre><code>detector.setDetectDelay(1000);
</code></pre>

<p>Default: <code>500ms</code></p>

<hr>

<h2>Complete Example</h2>

<pre><code>const detector = new DevtoolsDetector({
    checkers: [
        debuggerChecker,
        performanceChecker,
        erudaChecker,
        vConsoleChecker
    ],
    detectDelay: 500
});

detector.addListener((isOpen, payload) =&gt; {
    if (isOpen) {
        alert(`DevTools detected by ${payload.checkerName}`);
    }
});

detector.launch();
</code></pre>

<hr>

<h2>Limitations</h2>

<ul>
    <li>Browser implementations differ.</li>
    <li>Detection methods can be bypassed.</li>
    <li>False positives and false negatives are possible.</li>
    <li>This library should be considered a monitoring utility, not a security mechanism.</li>
    <li>Sensitive business logic should always be protected on the server side.</li>
</ul>

<hr>

<h2>Use Cases</h2>

<ul>
    <li>Detect unauthorized debugging attempts</li>
    <li>Monitor client-side tampering</li>
    <li>Protect premium web applications</li>
    <li>Prevent casual source inspection</li>
    <li>Detect mobile debugging environments</li>
    <li>Research and analytics</li>
</ul>

<hr>

<h2>License</h2>

<p>
MIT License<br>
Feel free to use, modify, and distribute this project.
</p>
