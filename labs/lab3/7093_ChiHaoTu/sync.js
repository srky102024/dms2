const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3001;

const student_id_last_four = "7093"; // Replace with your last four digits of student ID
const mongo_uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3";
const db_name = "lab3";
const collection_name = `${student_id_last_four}_collection`;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Define a Schema
const dataSchema = new mongoose.Schema({}, { collection: collection_name });
const DataModel = mongoose.model("Data", dataSchema);

// API Endpoint to fetch data
app.get(`/api/${collection_name}`, async (req, res) => {
  try {
    const data = await DataModel.find({});
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
