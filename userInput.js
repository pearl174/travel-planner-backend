const express = require('express');
const bodyParser = require('body-parser');
const {
    createPool
} = require('mysql');

const pool = createPool({
    host     : 'localhost',
    user     : 'root',
    password : '1234',
    database : 'itinerary_project',
    connectionLimit: 10
  });

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// route definition, where data(user credentials) to be received
app.post('/signup', (req, res) => {
    const data = req.body;
    pool.query("INSERT INTO Users (User_Name, Password, Email) VALUES (?, ?, ?)", [data.username, data.password, data.email], (error, results, fields) => {
        if (error) {
            res.status(500).json({ error: "An error occurred while inserting data into the database"});
        } else {
            res.status(200).json({ success: true, message: "User credentials successfully inserted into the table"});
        }
    });
});

app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});


// login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
  
    // Example SQL select query to check username and password
    pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (error, results, fields) => {
      if (error) {
        res.status(500).json({ error: 'An error occurred while querying the database' });
      } else {
        if (results.length > 0) {
          // Username and password combination exists
          res.status(200).json({ success: true, message: 'Username and password combination exists' });
        } else {
          // Username and password combination doesn't exist
          res.status(404).json({ error: 'Username and password combination does not exist' });
        }
      }
    });
  });
  

// on login
// getting all the destinations
app.get('/getDestinations', (req, res) => {
  pool.query("SELECT * FROM Destinations", (err, result, fields) => {
      if (err) {
        res.status(500).json({ error: 'An error occurred while querying the database' });
      }
      else {
        res.send(result);
      }
  })
})

// have to extract destination id from the url using what again?
// have to have a get request and get the respective places for that particular destination
app.get('/getDestinations/:id', (req, res) => {
    const id = req.params.id;
    pool.query("SELECT * FROM Places WHERE Destinations_Id = ?", [id], (error, results, fields) => {
      if (error) {
        res.status(500).json({ error: "An error occurred while querying the database"});
      }
      else if (results.length > 0) {
        res.json(results); // Return places if found
      } else {
        res.status(404).json({ error: "No places found for the given destination ID" });
      }
    })
    // res.send(`Received id: ${id}`); receiving correct id in postman!
})


//     if (error) {
//       console.error("Error querying database:", error);
//       res.status(500).json({ error: "An error occurred while querying the database"});
//     }
//     else {
//       if (results.length > 0) {
//         res.json(results); // Return places if found
//       } else {
//         res.status(404).json({ error: "No places found for the given destination ID" });
//       }
//     }
//   });
// });
