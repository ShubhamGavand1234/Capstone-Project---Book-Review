import express from "express";
import ejs from "ejs";
import pg from "pg";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;

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
app.get("/", async (req, res) => {
  const result = await db.query(
    "select b.id, b.title, b.author, d.description from books as b join details as d ON b.id = d.book_id;"
  );
  const bookData = result.rows;
  console.log(result.rows);

  res.render("index.ejs", { books: bookData });
});

app.get("/googlebooks", async (req, res) => {
  const key = "AIzaSyB87tkJzQ-waEaIdIK9YLh4Tk8EFY18iE0";
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
    res.render("index.ejs", { books: googlebooks });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server error");
  }
});

app.listen(port, () => {
  console.log(`Application running on ${port}`);
});
