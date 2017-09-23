const Database = require("../server/lib/database");
const Tester = require("./lib/tester");
const Assert = require("assert");

const tr = new Tester();
const db = new Database("test.conf.json");

db.addQuery("insert", (val)=>{
	return [
		`INSERT INTO test (val) VALUES ('${val}');`,
		`SELECT last_insert_rowid() AS id;`
	].join("\n");
});

db.addQuery("insertObject", (val)=>{
	return [
		`INSERT INTO test (id, val) VALUES (${val.id}, '${val.val}');`,
		`SELECT last_insert_rowid() AS id;`
	].join("\n");
});

db.addQuery("select", (id)=>{
	return `SELECT * FROM test WHERE id = ${id};`;
});

tr.addTest("safe insert string", ()=>{
	let val = "foobar";
	let ins = db.getOne("insert", val);
	let row = db.getOne("select", ins.id);
	Assert.equal(row.val, val);
});

tr.addTest("insert string with single quotes", ()=>{
	let val = "foo'n'bar";
	let ins = db.getOne("insert", val);
	let row = db.getOne("select", ins.id);
	Assert.equal(row.val, val);
});

tr.addTest("insert string with more single quotes", ()=>{
	let val = "foo''n''bar";
	let ins = db.getOne("insert", val);
	let row = db.getOne("select", ins.id);
	Assert.equal(row.val, val);
});

tr.addTest("insert string with double quotes", ()=>{
	let val = 'foo"n"bar';
	let ins = db.getOne("insert", val);
	let row = db.getOne("select", ins.id);
	Assert.equal(row.val, val);
});

tr.addTest("insert string with more double quotes", ()=>{
	let val = 'foo""n""bar';
	let ins = db.getOne("insert", val);
	let row = db.getOne("select", ins.id);
	Assert.equal(row.val, val);
});

tr.addTest("insert string with newlines", ()=>{
	let val = "foo\nbar\nzap";
	let ins = db.getOne("insert", val);
	let row = db.getOne("select", ins.id);
	Assert.equal(row.val, val);
});

tr.addTest("insert string with semicolons", ()=>{
	let val = "foo;bar;;zap";
	let ins = db.getOne("insert", val);
	let row = db.getOne("select", ins.id);
	Assert.equal(row.val, val);
});

tr.addTest("insert key->val object with nasty string", ()=>{
	let val = {
		id:42,
		val:"a''b\"\"c;;d\ne f"
	};
	let ins = db.getOne("insertObject", val);
	let row = db.getOne("select", val.id);
});

// TODO: hmmm...
/*
tr.addTest("insert string with backslash", ()=>{
	let val = "foo\bar\\zap\\\dub\\\\dip";
	let ins = db.getOne("insert", val);
	let row = db.getOne("select", ins.id);
	Assert.equal(row.val, val);
});
*/

tr.run();
