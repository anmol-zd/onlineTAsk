const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path')
const cors = require('cors');
const app = express();
app.use(cors())
require('dotenv').config();
const bodyparser = require('body-parser');

app.use(bodyparser.json());
app.use(express.static(path.join(__dirname, 'public')));


const port = 7000;

// Server start
app.listen(port, () =>
    console.log(`Server is running on ${port}`)
);
app.use(express.json());

// Define variables to store data
let authors = {};
let books = {};

// Function to log user requests in a file
function logRequest(req) {
    const logMessage = `${new Date().toISOString()} - ${req.method} - ${req.url} - ${JSON.stringify(req.body)}\n`;
    fs.appendFile('requests.log', logMessage, (err) => {
        if (err) console.error(err);
    });
}

// Endpoint to create a new author

app.post('/author', (req, res) => {

    logRequest(req);

    const { name } = req.body;
    if (!name) {
        return res.status(400).send('Author name is required');
    }

    // Check if author already exists
    const existingAuthor = Object.values(authors).find(author => author.name === name);
    if (existingAuthor) {
        return res.status(400).send('Author name must be unique');
    }

    // Create a new author with a unique ID
    const id = uuidv4();
    const author = { id, name };
    authors[id] = author;

    res.status(201).json(author);
});

// Endpoint to create a new book
app.post('/book', (req, res) => {
    logRequest(req);

    const { authorId, bookName, ISBN } = req.body;
    if (!authorId || !bookName || !ISBN) {
        return res.status(400).send('Author ID, book name, and ISBN are required');
    }

    // Check if author exists
    const author = authors[authorId];
    if (!author) {
        return res.status(400).send('Author not found');
    }

    // Check if ISBN already exists
    const existingBook = Object.values(books).find(book => book.ISBN === ISBN);
    if (existingBook) {
        return res.status(400).send('ISBN must be unique');
    }

    // Create a new book with a unique ID
    const id = uuidv4();
    const book = { id, authorId, bookName, ISBN };
    books[id] = book;

    res.status(201).json(book);
});

// Endpoint to get all authors
app.get('/author', (req, res) => {
    logRequest(req);

    const authorList = Object.values(authors);
    res.json(authorList);
});

// Endpoint to get all books
app.get('/book', (req, res) => {
    logRequest(req);

    const bookList = Object.values(books);
    res.json(bookList);
});

// Endpoint to get a single author and their books
app.get('/author/:id', (req, res) => {
    logRequest(req);

    const { id } = req.params;
    const author = authors[id];
    if (!author) {
        return res.status(404).send('Author not found');
    }

    const authorBooks = Object.values(books).filter(book => book.authorId === id);
    const response = { author, books: authorBooks };
    res.json(response);
});

// Endpoint to get a single book and its author
app.get('/book/:id', (req, res) => {
    logRequest(req);

    const { id } = req.params;
    const book = books[id];
})