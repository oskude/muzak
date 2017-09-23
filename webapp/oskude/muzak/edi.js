function Edi ()
{
	this.events = new Map();
}

Edi.prototype.subscribe = function (eventName, callback)
{
	if (!this.events.has(eventName)) {
		this.events.set(eventName, []);
	}

	let list = this.events.get(eventName);
	list.push(callback);
	this.events.set(eventName, list);
}

Edi.prototype.trigger = function (eventName, data)
{
	let list = this.events.get(eventName);

	if (list) {
		list.forEach((callback)=>{
			callback(data);
		});
	}
}

export default Edi;
export let edi = new Edi();
