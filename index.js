require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const { body, validationResult } = require("express-validator");
const urlParser = require("url");
const dns = require("dns");
const crypto = require("crypto");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});
const urlDatabase = {};
// Api endpoints
app.post("/api/shorturl", (req, res) => {
  const { url } = req.body;
  const hostname = urlParser.parse(url).hostname;
  console.log("hostname", hostname);

  if (hostname !== null) {
    dns.lookup(hostname, (err) => {
      if (err) {
        res.json({ error: "invalid url" });
        return;
      }
      const short_url = crypto.randomBytes(3).toString("hex");
      urlDatabase[short_url] = url;
      res.json({
        original_url: url,
        short_url,
      });
    });
  } else {
    res.json({ error: "invalid url" });
  }
});

app.get("/api/shorturl/:short_url", (req, res) => {
  const { short_url } = req.params;
  if (urlDatabase[short_url]) {
    res.redirect(urlDatabase[short_url]);
  } else {
    res.json({ error: "invalid short url" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
