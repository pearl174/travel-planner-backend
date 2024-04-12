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

const cors = require('cors');
const corsOptions ={
  origin:'http://localhost:3000', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200
}
app.use(cors(corsOptions));
app.use(bodyParser.json());

const PORT = 3000;
app.listen(PORT, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", PORT);
});

let userId = 5; // will get updated when the user logs in 
// keeping 1 while testing with postman, remove when integrating

// route definition, where data(user credentials) to be received
app.post('/signup', (req, res) => {
    const data = req.body;
    pool.query("INSERT INTO Users (User_Name, Password, Email) VALUES (?, ?, ?)", [data.name, data.password, data.email], (error, results, fields) => {
        if (error) {
            res.status(500).json({ error: "An error occurred while inserting data into the database"});
        } else {
            res.status(200).json({ success: true, message: "User credentials successfully inserted into the table"});
        }
    });
});

// login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    // Example SQL select query to check username and password
    pool.query("SELECT * FROM users WHERE email = (?) AND password = (?)", [email, password], (error, results, fields) => {
      if (error) {
        res.status(500).json({ error: "An error occurred while querying the database" });
      } else {
        if (results.length > 0) {
          // Username and password combination exists
          res.status(200).json({ success: true, message: "Username and password combination exists" });
        } else {
          // Username and password combination doesn't exist
          res.status(404).json({ error: "Username and password combination does not exist" });
        }
      }
    });
  });

app.get('/getUserId/:mail', (req, res) => {
  const mail = req.params.mail;
  pool.query("SELECT User_Id FROM Users WHERE email = (?)", [mail], (error, results, fields) => {
    if (error) {
      res.status(500).json({ error: "An error occurred while querying the database" });
    }
    else if (results.length > 0) {
      res.send(results);
      userId = results[0].userId;
    } else {
      res.status(404).json({ error: "Error" });
    }
  })
})

// on login
// getting all the destinations
app.get('/getDestinations', (req, res) => {
  pool.query("SELECT * FROM Destinations", (error, result, fields) => {
      if (error) {
        res.status(500).json({ error: "An error occurred while querying the database" });
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
    pool.query("SELECT * FROM Places WHERE Destinations_Id = (?)", [id], (error, results, fields) => {
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

// when the user adds all the places to his itinerary
// initializing the itinerary record corresponding to this itinerary
// then getting the id from this record and inserting into the day_to_day table
app.post('/insertPlaces', (req, res) => {
    const placesData = req.body; 

    // using uId for testing at the very least because for postman
    // the request was not made for the userId and its value is hence -1 for now
    pool.query("INSERT INTO Itinerary (User_Id) VALUES (?)", [userId], (error, results, fields) => {
      if (error) {
        console.log(error)
        return res.status(500).json({ error: "An error occurred while initializing the itinerary table"});
      } 
      pool.query("SELECT Itinerary_Id FROM Itinerary WHERE User_Id = (?)", [userId], (error, results, fields) => {
        if (error) {
          return res.status(500).json({ error: "An error occurred while querying the itineraryId from the database"});
        }
        console.log(results[0].Itinerary_Id)
        const itineraryId = results[0].Itinerary_Id;
        (async () => {
          for (const placeData of placesData) {
              const { placeId, date } = placeData;
              try {
                  await pool.query("INSERT INTO Day_to_Day (Places_Id, Date, Itinerary_Id) VALUES (?, ?, ?)", [placeId, date, itineraryId]);
              } catch (error) {
                  return res.status(500).json({ error: "An error occurred while inserting data into the Day_to_Day table"});
              }
          }

          // Send the response after all queries have completed successfully
          res.status(200).json({ success: true, message: "Values inserted successfully into the Day_to_Day table"});
      })();
      });
    });
});
// result.itinerary id do ig. check postman
// then insert that with the data into the day to day table. although it will be an array ig. so big query???
// getHotels??

// app.post('/login', (req, res) => {
//   const { email, password } = req.body;
//   pool.query("SELECT * FROM users WHERE email = (?) AND password = (?)", [email, password], (error, results, fields) => {
//     if (error) {
//       res.status(500).json({ error: "An error occurred while querying the database" });
//     } else {
//       if (results.length > 0) {
//         // Username and password combination exists
//         res.status(200).json({ success: true, message: "Username and password combination exists" });
//       } else {
//         // Username and password combination doesn't exist
//         res.status(404).json({ error: "Username and password combination does not exist" });
//       }
//     }
//   });
// });