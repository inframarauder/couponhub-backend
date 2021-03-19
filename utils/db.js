const mongoose = require("mongoose");

exports.createConnection = async () => {
  try {
    const { DB_URI } = process.env;
    await mongoose.connect(DB_URI, {
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: false,
    });
    console.log("Connected to DB");
  } catch (error) {
    console.error("Error in DB connection!\n", error);
  }
};
