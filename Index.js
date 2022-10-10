const app = require("./app");
const dbCannect = require("./dbconfig");
const cloudinary = require("cloudinary");
require("dotenv").config();
const port = process.env.PORT || 5000;
const mongodb = process.env.MONGO_URL;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

//database connection and server listening
dbCannect(mongodb, {
  useNewUrlParser: true,
  useUnifiedToplogy: true,
  userCreateIndex: true,
}).then((data) => {
  const server = app.listen(port, () => {
    console.log(
      `Db is connected to ${mongodb}, and server is running on ${port}`
    );
  });
});
