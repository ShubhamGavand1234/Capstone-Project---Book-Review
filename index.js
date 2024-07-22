import express from "express";
import ejs from "ejs";
import pg from "pg";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
const key = "AIzaSyB87tkJzQ-waEaIdIK9YLh4Tk8EFY18iE0";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const db = new pg.Client({
  user: "postgres",
  password: "admin",
  database: "library",
  host: "localhost",
  port: 5432,
});

db.connect();

let logedInUser = 0;

app.get("/", async (req, res) => {
  if (logedInUser !== 0) {
    try {
      // const result = await db.query(
      //   "select b.id, b.title, b.author, d.description from books as b join details as d ON b.id = d.book_id;"
      // );
      const result = await db.query(
        "select b.id, b.title, b.author, r.review from reviews as r Join users as u ON user_id = u.id JOIN books as b ON book_id = b.id where  u.id = $1;",
        [logedInUser]
      );
      const bookData = result.rows;
      console.log(result.rows);

      res.render("index.ejs", { books: bookData });
    } catch (error) {}
  } else {
    res.send("<h1></h1> <a href='/login'>Login</a>");
  }
});

app.get("/findbook", async (req, res) => {
  try {
    res.render("findbook.ejs");
  } catch (error) {
    console.log(error);
  }
});

app.post("/findbook", async (req, res) => {
  try {
    const book = req.body.book;
    console.log(book);
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q='${book}'&maxResults=40&key=${key}`
    );
    const googlebooks = [];
    let id = 1;
    response.data.items.forEach((book) => {
      let newBook = {
        id: id++,
        title: book.volumeInfo.title,
        author: book.volumeInfo.authors[0] || "Unknown",
        description: book.volumeInfo.description
          ? book.volumeInfo.description
          : "No description available",
      };
      googlebooks.push(newBook);
    });
    res.render("googlebooks.ejs", { books: googlebooks });
  } catch (error) {
    console.log(error);
  }
});

app.get("/googlebooks", async (req, res) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=pokemon&maxResults=40&key=${key}`
    );
    const googlebooks = [];
    let id = 1;
    response.data.items.forEach((book) => {
      // console.log(
      //   book.volumeInfo.title,
      //   book.volumeInfo.authors[0],
      //   book.volumeInfo.description
      // );
      let newBook = {
        id: id++,
        title: book.volumeInfo.title,
        author: book.volumeInfo.authors[0],
        description: book.volumeInfo.description
          ? book.volumeInfo.description
          : "No description available",
      };
      googlebooks.push(newBook);
    });
    //   console.log(googlebooks.length, googlebooks);
    //   res.sendStatus(200);
    res.render("googlebooks.ejs", { books: googlebooks });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server error");
  }
});

//registraation get
app.get("/registration", async (req, res) => {
  try {
    res.render("registrationForm.ejs");
  } catch (error) {
    console.log(error);
  }
});

app.post("/registration", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(username, password);
    await db.query("insert into users (username, password) values ($1 , $2);", [
      username,
      password,
    ]);
    res.redirect("/login");
  } catch (error) {
    console.log(error);
  }
});

//login routes
app.get("/login", async (req, res) => {
  try {
    res.render("login.ejs");
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(username, password);
    const result = await db.query(
      "select id from users where username = $1 and password = $2;",
      [username, password]
    );
    console.log(result.rows[0].id);
    logedInUser = result.rows[0].id;
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Application running on ${port}`);
});
