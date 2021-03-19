require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./utils/db");
const apiRoutes = require("./routes");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//server-root
app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.use("/api", apiRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  db.createConnection();
});
