function Tester ()
{
	this.tests = new Map;
	this.RESET = "\x1b[0m";
	this.GREEN = "\x1b[32m";
	this.RED = "\x1b[31m";
}

Tester.prototype.run = function ()
{
	for (let [name, test] of this.tests) {
		try {
			test();
			console.log(`${this.GREEN}[OK] ${name}${this.RESET}`);
		} catch (error) {
			console.log(`${this.RED}[EE] ${name}${this.RESET} :`, error);
		}
	}
}

Tester.prototype.addTest = function (name, test)
{
	this.tests.set(name, test);
}

module.exports = Tester;
