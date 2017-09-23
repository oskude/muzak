const Fs = require("fs");
const Path = require("path");

exports.verify = (file, attributes) => {
	let config = null;
	let filePath = null;
	let fileDirs = [
		Path.join("/etc", file),
		Path.join("/usr/local/etc", file),
		Path.resolve(file)
	];

	fileDirs.forEach((path)=>{
		if (Fs.existsSync(path)) {
			filePath = path;
		}
	});

	if (!filePath) {
		throw `no config file found in paths:\n${fileDirs.join("\n")}`;
	}

	if (!Fs.statSync(filePath).isFile()) {
		throw `config file is not a file:\n${filePath}`;
	}

	try {
		Fs.accessSync(filePath, Fs.constants.R_OK);
	} catch (error) {
		throw `config file is not not readable:\n'${filePath}'\n${error.message}`;
	}

	try {
		config = JSON.parse(Fs.readFileSync(filePath, "utf8"));
	} catch (error) {
		throw `json error in config file:\n${filePath}\n${error.message}`;
	}

	attributes.forEach((attr)=>{
		if (!config.hasOwnProperty(attr.name) && !attr.optional) {
			throw `'${attr.name}' not set in config file:\n${filePath}\n${JSON.stringify(config)}`;
		}

		if (attr.type == "dir" || attr.type == "file") {
			config[attr.name] = Path.resolve(config[attr.name]);
			if (!Fs.existsSync(config[attr.name])) {
				throw `'${attr.name}' path not found:\n${config[attr.name]}`;
			}
		}

		if (attr.type == "dir") {
			if (!Fs.statSync(config[attr.name]).isDirectory()) {
				throw `'${attr.name}' value is not a directory:\n${config[attr.name]}`;
			}
		}

		if (attr.type == "file") {
			if (!Fs.statSync(config[attr.name]).isFile()) {
				throw `'${attr.name}' value is not a file:\n${config[attr.name]}`;
			}
		}

		if (attr.type == "string") {
			if (typeof config[attr.name] != "string") {
				throw `config value '${attr.name}' is not a string:\n${config[attr.name]}`;
			}
		}

		if (attr.type == "number") {
			if (typeof config[attr.name] != "number") {
				throw `config value '${attr.name}' is not a number:\n${config[attr.name]}`;
			}
		}

		if (attr.type == "bool") {
			if (!config.hasOwnProperty(attr.name)) {
				config[attr.name] = attr.default;
			}
		}

		if (attr.access) {
			attr.access.split("").forEach((key)=>{
				let access = null;
				if (key.toUpperCase() == "R") access = Fs.constants.R_OK;
				else if (key.toUpperCase() == "W") access = Fs.constants.W_OK;
				else if (key.toUpperCase() == "X") access = Fs.constants.X_OK;
				else throw `unknown acces key: ${key}`;
				try {
					Fs.accessSync(config[attr.name], access);
				} catch (error) {
					throw `no ${key.toUpperCase()} acces to: '${config[attr.name]}'`;
				}
			})
		}
	});

	return config;
}
