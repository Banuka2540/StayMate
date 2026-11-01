const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// GET API
app.get("/api/hello", (req, res) => {

    res.json({
        message: "Hello from Express Backend!"
    });

});

// Start server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});