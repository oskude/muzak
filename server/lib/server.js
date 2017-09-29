const Fs = require("fs");
const {URL} = require("url");
const Http = require("http");
const Path = require("path");

const Config = require("./config");

function FooServer (configFile)
{
	try {
		this.config = Config.verify(
			configFile,[
				{name: "debug",   type: true,  default: false, optional: true},
				{name: "appPath", type: "dir", access: "R"},
				{name: "host",    type: "string"},
				{name: "port",    type: "number"}
			]
		);
	} catch (error) {
		process.stderr.write(`exit cause ${error}\n`);
		process.exit(1); // TODO: hmm...
	};

	this.ctype = new Map();
	this.ctype.set(".html", "text/html");
	this.ctype.set(".js", "application/javascript");
	this.handlers = {};
}

FooServer.prototype.resolveAccepts = function (accepts)
{
	// TODO: resolve q https://developer.mozilla.org/en-US/docs/Glossary/Quality_values
	return accepts.split(",").map(v=>v.split(";")[0]);
}

FooServer.prototype.sendError = function (req, res, code, msg)
{
	let outMsg = msg;

	if (code == 500) {
		console.log("### ERROR:", msg);
		outMsg = 500;
	}

	res.writeHead(code);

	if (
		req.accepts.includes("*/*")
		|| req.accepts.includes("application/json")
	) {
		res.end(JSON.stringify({ERROR:outMsg}));
	}
	else {
		res.end(outMsg.toString());
	}
}

FooServer.prototype.router = function (request, response)
{
	let url = new URL(`http://whatever${request.url}`);

	if (url.pathname == "/") {
		url.pathname = "/main.html";
	}

	let req = {
		url: request.url,
		path: url.pathname,
		method: request.method.toUpperCase(),
		accepts: this.resolveAccepts(request.headers.accept),
		params: url.searchParams,
		extension: Path.extname(url.pathname) || null
	};

	let res = {
		response: response,
		sendJson: (code, msg) => {
			let outMsg = msg;
			if (code == 500) {
				console.error("### ERROR:", msg);
				outMsg = "Internal Error";
			}
			if (this.config.debug) {
				console.info("res >>", outMsg);
			}
			response.writeHead(code, {"Content-Type":"application/json"});
			response.end(JSON.stringify(outMsg));
		}
	}

	if (this.config.debug) {
		console.log("- - - - - - - - - - - - - - - - - - - - - - - - ");
		console.log("req >>", req);
	}

	if (req.extension) {
		req.ctype = this.ctype.get(req.extension);
		this.serveFile(req, response);
	} else {
		if (!this.handlers[req.method]) {
			this.sendError(req, response, 500, `no ${req.method} handlers registerd.`);
			return;
		}

		let pathHandler = this.handlers[req.method].get(req.path);

		if (!pathHandler) {
			this.sendError(req, response, 500, `no ${req.method} handler found for path ${req.path}`);
			return;
		}

		for (let accept of req.accepts) {
			if (pathHandler.has(accept)) {
				let acceptHandler = pathHandler.get(accept);
				acceptHandler(req, res);
				return;
			}
		}

		this.sendError(
			req,
			response,
			500,
			`no ${req.method} handler found for path ${req.path} with accepts ${JSON.stringify(req.accepts)}`);
	}
}

FooServer.prototype.serveFile = function (req, response)
{
	let path = Path.join(this.config.appPath, req.path);

	if (Fs.existsSync(path) && Fs.statSync(path).isFile()) {
		if (this.config.debug) {
			console.info("res >>", path);
		}
		Fs.readFile(path, "utf-8", (error, content) => {
			if (error) {
				response.writeHead(500);
				response.end("interal error.\n");
			} else {
				response.writeHead(200, {'Content-Type':req.ctype});
				response.end(content, "utf-8");
			}
		});
	} else {
		response.writeHead(404);
		response.end("not found.\n");
	}
}

FooServer.prototype.start = function ()
{
	let srv = Http.createServer(this.router.bind(this));
	srv.listen(this.config.port, this.config.host);
}

FooServer.prototype.addHandler = function (method, path, accepts, handler)
{
	let m = method.toUpperCase();

	if (!this.handlers[m]) {
		this.handlers[m] = new Map();
	}

	for (let accept of accepts) {
		if (!this.handlers[m].has(path)) {
			this.handlers[m].set(path, new Map());
		}
		let h = this.handlers[m].get(path);
		h.set(accept, handler);
	}
}

module.exports = FooServer;
