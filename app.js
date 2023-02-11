const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is started running!");
    });
  } catch (e) {
    console.log(e.message);
    process.exit();
  }
};

initializeDbAndServer();

//get

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT * FROM movie;`;
  const getMovieDetails = await db.all(getMoviesQuery);
  response.send(getMovieDetails);
});

//post
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `
  INSERT INTO 
    movie (director_id, movie_name, lead_actor)
    VALUES (${directorId}, '${movieName}', '${leadActor}');`;

  const newMovie = await db.run(addMovieQuery);
  const movieId = newMovie.lastID;
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const getMovieQuery = `
    SELECT * 
    FROM movie 
    WHERE movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(movie);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const updateMovieDetails = request.body;
  const { directorId, movieName, leadActor } = updateMovieDetails;

  const updateMovieQuery = `
  UPDATE 
  movie
  SET
  director_id = ${directorId},
  movie_name = '${movieName}',
  lead_actor = '${leadActor}';`;

  const dbUpdate = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM
    movie WHERE movie_id = ${movieId};`;

  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const allDirectorsDataQuery = `SELECT * FROM director;`;

  const directorData = await db.all(allDirectorsDataQuery);

  response.send(directorData);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieNamesQuery = `SELECT movie_name FROM movie
    NATURAL JOIN director;`;
  const movieData = await db.get(getMovieNamesQuery);
  response.send(movieData);
});

module.exports = app;
