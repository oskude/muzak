function Api ()
{
}

Api.prototype.request = function (method, accept, path, data)
{
	let url = new URL(window.location.origin);

	url.pathname = path;
	for (let key in data) {
		url.searchParams.set(key, data[key]);
	}

	return fetch(url, {
		method: method.toUpperCase(),
		headers: {
			accept: accept.join(",")
		}
	});
}

Api.prototype.getJson = function (path, data)
{
	return this.request("get", ["application/json"], path, data)
		.then(x=>x.json());
}

Api.prototype.postJson = function (path, data)
{
	return this.request("post", ["application/json"], path, data)
		.then(x=>x.json());
}

Api.prototype.patchJson = function (path, data)
{
	return this.request("patch", ["application/json"], path, data)
		.then(x=>x.json());
}

Api.prototype.deleteJson = function (path, data)
{
	return this.request("delete", ["application/json"], path, data)
		.then(x=>x.json());
}

export default Api;
export let api = new Api();
