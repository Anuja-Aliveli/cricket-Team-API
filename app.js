// All exports 
const express = require("express");
const path = require("path");

const {open} = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname,"cricketTeam.db");
let db = null;

//Initialize server and connect database
const initializeAndConnect = async() => {
    try {
        db = await open ({
            filename: dbPath,
            driver: sqlite3.Database,
        });       
        app.listen(3000,() => {
            console.log("sever running at port 3000");
            console.log("Database sqlite connected");
        });
    }
    catch(err) {
        console.log(`Db Error ${err.message}`);
        process.exit(1);
    }
}
initializeAndConnect();

// API 1 
app.get("/players/", async (request, response) => {
  const getQuery = `
    SELECT
      *
    FROM
      cricket_team
      ORDER BY player_id;`;
  const playersArray = await db.all(getQuery);
  const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
  response.send(playersArray.map((eachPlayer) =>
        convertDbObjectToResponseObject(eachPlayer)));
});

// API 2 
app.post("/players/", async(request,response) => {
    const playerDetails = request.body;
    const {playerName, jerseyNumber, role} = playerDetails;
    const queryAPI2 = `INSERT INTO 
                        cricket_team(player_name,jersey_number,role)
                        VALUES ('${playerName}','${jerseyNumber}','${role}');`;
    const dbResponse = await db.run(queryAPI2);
    response.send("Player Added to Team");
});

// API 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  const playerArray = await db.get(getPlayerQuery);
  const newPlayerArray = {
    playerId: playerArray.player_id,
    playerName: playerArray.player_name,
    jerseyNumber: playerArray.jersey_number,
    role: playerArray.role
};
  response.send(newPlayerArray);  
});

// API 4 
app.put("/players/:playerId/", async(request, response) => {
    const {playerId} = request.params;
    const updateDetails = request.body;
    const {playerName,jerseyNumber,role} = updateDetails;
    const queryAPI4 = `UPDATE cricket_team SET 
                        player_name = '${playerName}',
                        jersey_number = '${jerseyNumber}',
                        role = '${role}'
                        WHERE 
                        player_id = ${playerId};`;
    await db.run(queryAPI4);
    response.send("Player Details Updated");
});

// API 5 
app.delete("/players/:playerId", async(request,response) => {
    const {playerId} = request.params;
    const queryAPI5 = `DELETE from cricket_team where player_id = ${playerId};`;
    await db.run(queryAPI5);
    response.send("Player Removed");
});

module.exports = app;