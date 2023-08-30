const mongoose = require("mongoose");
const validator = require("validator");
// to fix new update error below line is helpful

mongoose.set("strictQuery", true);
mongoose
  .connect("mongodb://127.0.0.1:27017/myapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("mongoose connected successfully..."))
  .catch((error) => console.log(error));

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  videos: Number,
  author: String,
  email: {
    type: String,
    required: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  active: Boolean,
  date: {
    type: Date,
    default: Date.now,
  },
});
// collection creation
const Collection = new mongoose.model("collection", playlistSchema);

const createDocument = async () => {
  try {
    // const jsPlaylist = new Collection({
    //     name: "javascript",
    //     ctype: "Front End",
    //     videos: "150",
    //     author: "Souvik Roy",
    //     active: true
    // })
    // const mongoPlaylist = new Collection({
    //     name: "mongoDB",
    //     ctype: "Database",
    //     videos: "20",
    //     author: "Souvik Roy",
    //     active: true
    // })
    // const mongoosePlaylist = new Collection({
    //     name: "mongoose",
    //     ctype: "Database",
    //     videos: "40",
    //     author: "Souvik Roy",
    //     active: true
    // })
    const expressPlaylist = new Collection({
      name: "express js",
      ctype: "Back End",
      videos: "30",
      author: "Souvik Roy",
      email: "kuchbhi32@gmail.com",
      active: true,
    });

    const result = await Collection.insertMany([expressPlaylist]);
    console.log(result);
  } catch (error) {
    console.log(error);
  }
};
createDocument();

// read and quering in mongoose
const getDocument = async () => {
  try {
    const result = await Collection.find({ $and: [{ author: "Souvik Roy" }] })
      .select({ name: 1 })
      .sort({ name: 1 });
    // .countDocuments();
    // .limit(1);
    console.log(result);
  } catch (error) {
    console.log(error);
  }
};
getDocument();

// $eq $gt $gte $in $lt $lte $ne $nin comparison operators
// $and $or $not $nor logical operators

// update document
const updateDocument = async (id) => {
  try {
    const result = await Collection.findByIdAndUpdate(
      { _id: id },
      { $set: { name: "JavaScript" } }
    );

    console.log(result);
  } catch (error) {
    console.log(error);
  }
};
updateDocument("63c2c689f19e0cff34bf31d8");

// delete document
const deleteDocument = async (id) => {
  try {
    const result = await Collection.findByIdAndDelete({ _id: id });
    console.log(result);
  } catch (error) {
    console.log(error);
  }
};
deleteDocument("63c2c689f19e0cff34bf31d7");
