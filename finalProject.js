const http = require("http");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, 'info.env') }); 

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;

/* Our database and collection */
const databaseAndCollection = {db: "CMSC335_DB", collection:"storeDB"};
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${userName}:${password}@cluster0.sj7ka9r.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const express = require("express"); /* Accessing express module */
const app = express(); /* app is a request handler function */

app.set("views", path.resolve(__dirname, "templates"));
app.use(express.static(path.join(__dirname, 'templates')));

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

const portNumber = 4000;
const fs = require("fs");
const { totalmem } = require("os");


async function insertItems(client, databaseAndCollection, items) {
    const result = await client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collection)
                        .insertMany(items);
}

async function deleteAll(client, databaseAndCollection) {
    let filter = {};
    const result = await client.db(databaseAndCollection.db)
                   .collection(databaseAndCollection.collection)
                   .deleteMany(filter);
    
     
}

app.get("/", (request, response) => {
  const image = '/templates/images/c1.jpg/'
    response.render("enter",{img: image});
});


app.get("/items", async (request, response) => {
 //Adding items to database
 await client.connect();
    let jean = {
        name : "Denim Shorts",
        count : 10,
        price : 100
    };

    let shirt = {
        name : "Shirt",
        count : 5,
        price : 45
    };

    let items = [jean, shirt];
    await insertItems(client, databaseAndCollection, items);

    response.render("itemsScreen");
});

app.post("/confirmation", async (request, response) => {
    let message = `<table border='1'><th>Item Name</th><th>Item Count</th>`;
    message += `<tr><td>Denim Shorts</td><td>${request.body.denim}</td></tr>`;
    message += `<tr><td>Oversized Graphic Shirt</td><td>${request.body.shirt}</td></tr>`;
    message += `</table>`

    let total = (request.body.denim * 100) + (request.body.shirt * 45);

    let variables = {
        num : Math.floor(Math.random() * 101) + 1,
        name: request.body.name,
        cost: total,
        table : message
    };

    //Deleting all items in database
    await client.connect();
    await deleteAll(client, databaseAndCollection);

    response.render("confirmation", variables);
});

process.stdin.setEncoding("utf8");

app.listen(portNumber);
console.log(`Web server is running at http://localhost:${portNumber}`);

const prompt = "Stop to shutdown the server: ";
process.stdout.write(prompt);

process.stdin.on("readable", function () {
    let dataInput = process.stdin.read();
    if (dataInput !== null) {
      let command = dataInput.trim();
      if (command === "stop") {
        process.stdout.write("Shutting down the server\n");
        process.exit(0);
      } else {
        process.stdout.write(`Invalid command: ${command}\n`);
      }
      process.stdout.write(prompt);
      process.stdin.resume();
    }
  });
  