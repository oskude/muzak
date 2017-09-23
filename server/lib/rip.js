const Fs = require("fs");
const Path = require("path");

function RIP ()
{
	this.newContent = "";
	this.expReplace = /<link rel="import"[^>]+>/;
	this.expGet = /<link rel="import" href="([^"]+)"/;
}

RIP.prototype.replaceImport = function (file)
{
	let match = this.newContent.match(this.expGet);
	if (match && match[1]) {
		let importFile = match[1];
		let importPath = Path.join(this.basePath, importFile);
		let importContent = "\n";
		if (!this.addedImports.has(importFile)) {
			importContent = Fs.readFileSync(importPath, "utf8");
			this.addedImports.set(importFile, true);
		}
		this.newContent = this.newContent.replace(this.expReplace, importContent);
		return true;
	}
	return false;
}

RIP.prototype.concat = function (file)
{
	this.basePath = Path.dirname(file);
	this.addedImports = new Map();
	this.newContent = Fs.readFileSync(file, "utf-8");
	while(this.replaceImport(file));
	return this.newContent;
}

module.exports = new RIP();
