const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = 3000;

const mongo_uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3";
const collection_name = "8155_Khushi"; 

app.use(cors());
app.use(express.json({ limit: "10mb" }));

mongoose
  .connect(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

console.log("Connecting to collection:", collection_name);

const dataSchema = new mongoose.Schema(
  {
    UUID: String,
    source_db: String,
    createdAt: String,
    updatedAt: String,
    brand: String,    
    product: String,  
    rating: Number, 
  },
  { collection: collection_name }
);

const DataModel = mongoose.model("Data", dataSchema);

app.post("/sync", async (req, res) => {
  try {
    const data = req.body;

    await DataModel.insertMany(data);
    res.status(200).json({ message: "Data synced successfully!" });
  } catch (error) {
    console.error("Error syncing data:", error);
    res.status(500).json({ message: "Error syncing data", error: error.message });
  }
});

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