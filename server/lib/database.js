const Cproc = require("child_process");
const Config = require("./config");

function FooDatabase (configFile)
{
	try {
		this.config = Config.verify(
			configFile,[
				{name: "debug",  type: "bool", default: false, optional: true},
				{name: "dbPath", type: "file", access: "W"}
			]
		);
	} catch (error) {
		process.stderr.write(`exit cause ${error}\n`);
		process.exit(1);
	};

	this.queries = new Map();
}

FooDatabase.prototype.parseTcl = function (data)
{
	let rows = [];
	let lines = data.split("\n");
	let header = JSON.parse('['+lines.shift().replace(/" "/g, '","')+']');

	// TODO: last line is always ^\n?
	lines.pop();

	lines.forEach((line)=>{
		let foo = '['+line.replace(/" "/g, '","')+']';
		let cells = JSON.parse(foo);
		let row = {};
		cells.forEach((v,i)=>{
			row[header[i]] = v;
		})
		rows.push(row);
	});

	return rows;
}

FooDatabase.prototype.query = function (query)
{
	// TODO: why is this still creating a journal file?
	// TODO: and how do we set this with -cmd? (and also use .mode)
	//query = `pragma journal_mode=MEMORY;\n${query}`;
	// TODO: using above gives it back in query result...

	if (this.config.debug) {
		console.log("query >>", query);
	}

	let ret = Cproc.spawnSync(
		"sqlite3",
		[
			"-header",
			"-cmd", ".mode tcl",
			"-bail",
			this.config.dbPath,
			query
		],
		{encoding:"utf8"}
	);

	if (ret.stderr) {
		throw `sqlite3 error: ${ret.stderr}`;
	}
	else {
		return this.parseTcl(ret.stdout);
	}
}

FooDatabase.prototype.addQuery = function (name, func)
{
	this.queries.set(name, func);
}

FooDatabase.prototype.escapeString = function (str)
{
	let out = str.replace(/'/g, "''");
	return out;
}

FooDatabase.prototype.runQuery = function (name, data)
{
	let q = this.queries.get(name);

	if (typeof data == "string") {
		data = this.escapeString(data);
	}
	else if (typeof data == "object") {
		for (let x in data) {
			if (typeof data[x] == "string") {
				data[x] = this.escapeString(data[x]);
			}
		}
	}

	return this.query(q(data));
}

FooDatabase.prototype.getOne = function (name, data)
{
	let rows = this.runQuery(name, data);
	return rows[0];
}

FooDatabase.prototype.getAll = function (name, data)
{
	return this.runQuery(name, data);
}

module.exports = FooDatabase;
