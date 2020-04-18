const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const Datastore = require('nedb');
const db = new Datastore({filename : "./database.db"});
db.loadDatabase();

const PORT = process.env.PORT||3000;
const app = express();
app.listen(PORT,console.log("listening on the port : "+PORT));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/",(req,res)=>{
	res.send("this is a sampel statemnet!");
});

// routes
app.post('/addSubject',(req,res)=>{
	db.insert(req.body,(err,newDoc)=>{
		if(!err){
			res.sendStatus(200);
		}else{
			res.sendStatus(500);
			return;
		}
	});
});

// sending all the records in the database!
app.get('/getRecords',(req,res)=>{
	db.find({},(err,docs)=>{
		if(!err){
			res.send(docs);
		}else{
			res.sendStatus(500);
			return;
		}
	});
});


// deleting the record!

app.post("/deleteSubject",(req,res)=>{
	db.remove({_id : req.body.id},(err,numRemove)=>{
		if(!err){
			res.sendStatus(200);
		}else{
			res.sendStatus(500);
		}
	});
});

