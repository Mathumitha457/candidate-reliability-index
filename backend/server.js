const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let users = [];

// GET USERS
app.get("/api/users", (req, res) => {
res.json(users);
});

// ADD USER
app.post("/api/users", (req, res) => {
const user = {
_id: Date.now().toString(),

name: req.body.name,
email: req.body.email,

attendance: 0,
performance: 0,
internship: 0,
behaviour: 0,

total: 0,

};

users.push(user);

res.json(user);
});

// UPDATE SCORE
app.put("/api/users/:id/score", (req, res) => {
const { category, change } = req.body;

const user = users.find((u) => u._id === req.params.id);

if (!user) {
return res.status(404).json({
error: "User not found",
});
}

user[category] += change;

// MIN LIMIT
if (user[category] < 0) {
user[category] = 0;
}

// MAX LIMIT
if (user[category] > 25) {
user[category] = 25;
}

// TOTAL
user.total =
user.attendance +
user.performance +
user.internship +
user.behaviour;

res.json(user);
});

// DELETE USER
app.delete("/api/users/:id", (req, res) => {
users = users.filter((u) => u._id !== req.params.id);

res.json({
message: "Deleted Successfully",
});
});

// SERVER
app.listen(5000, () => {
console.log("Server running on http://localhost:5000");
});
