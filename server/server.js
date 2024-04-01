const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connect = require("./database/connection");
connect();
const router = require("./router/route");
// const Auth = require('./middleware/auth')

const app = express();

/** Middleware */
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
app.disable("x-powered-by"); // Less hackers know about our stack

const port = 3000;

/** HTTP Get Request */
app.get("/", (req, res) => {
  res.status(201).json("Home Get Request");
});

/** api route */
// app.use('/api', Auth);
app.use("/api", router);

/** Start Server */
app.listen(port, () => {
  console.log(`Server Connected to http://localhost:${port}`);
});

// console.log('jai mata di')
