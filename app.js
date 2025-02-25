const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const crypto = require("crypto");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const session = require("express-session");
const passport = require("passport");
const mongoStore = require("connect-mongo");
const LocalStrategy = require("passport-local");
const atlasUri = process.env.DB_URI; // Replace with your Atlas URI

app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to MongoDB Atlas
mongoose
  .connect(atlasUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB Atlas:", err);
  });

const Schema = new mongoose.Schema({
  redirect: String,
  shortened: String,
});

const URLS = mongoose.model("urls", Schema);

// User authentication implementation -----------------------------------------------------------

function generatePass(password) {
  const salt = crypto.randomBytes(32).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return { salt, hash };
}

const userSchema = {
  username: String,
  salt: String,
  hash: String,
};

const Users = mongoose.model("users", userSchema);

passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(async function (id, cb) {
  try {
    const user = await Users.findById(id);
    cb(null, user);
  } catch (err) {
    cb(err);
  }
});

function validate(password, salt, hash) {
  const hashed = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return hash === hashed;
}

function verify(username, password, done) {
  try {
    Users.findOne({ username: username }).then((user) => {
      if (!user) {
        console.log("user not in database");
        return done(null, false);
      }
      const isValid = validate(password, user.salt, user.hash);
      if (isValid) {
        return done(null, user);
      } else {
        console.log("Wrong Password");
        return done(null, false);
      }
    });
  } catch (err) {
    return done(err);
  }
}

app.use(
  session({
    secret: process.env.SESSION,
    store: mongoStore.create({
      mongoUrl: process.env.DB_URI,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 72,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const strategy = new LocalStrategy(
  {
    usernameField: "username",
    passwordField: "password",
  },
  verify
);

passport.use(strategy);

app.get("/", async(req, res, next) => {
  if(req.session.passport){
    const userInDb = await Users.findOne({_id: req.session.passport.user})
    res.redirect(`/users/${userInDb.username}`)
    return
  }
  res.status(200).sendFile(path.join(__dirname, "./index.html"));
});
app.get('/users/:username', async(req, res, next)=>{
  if(req.isAuthenticated()){
  const {username} = req.params
  const userInDb = await Users.findOne({_id: req.session.passport.user})
  if(username == userInDb.username){
    res.status(200).sendFile(path.join(__dirname, 'home.html'))
    return
  }else{
    res.redirect(`/users/${userInDb.username}`)
    return
  }}else{
    res.redirect('/login')
    return
  }
  // console.log(username == req.session.passport.user)
})

function generate(longurl) {
  const salt = crypto.randomBytes(6).toString("hex");
  const hashed = crypto
    .pbkdf2Sync(longurl, salt, 100, 7, "sha512")
    .toString("hex");
  return hashed;
}

function isValidUrl(url) {
  if (url.includes(" ") || !url.includes(".") || url === "") {
    return false;
  }
  return true;
}

app.post("/api/shorten", async (req, res, next) => {
  if (isValidUrl(req.body.longurl)) {
    const longUrl = await URLS.findOne({
      redirect: req.body.longurl.toLowerCase(),
    });
    console.log(longUrl);
    if (longUrl) {
      const short = longUrl.shortened;
      res.status(200).json({ msg: `${req.get("host")}/${short}` });
      return;
    } else {
      const shorturl = generate(req.body.longurl);
      try {
        await URLS.create({
          redirect: req.body.longurl,
          shortened: shorturl,
        });

        res.status(200).json({ msg: `${req.get("host")}/${shorturl}` });
      } catch (error) {
        console.error("Error creating URL:", error);
        res.status(500).json({ msg: "Internal server error" }); // Handle creation error
      }
    }
  } else {
    res.status(200).json({ msg: "Please enter a valid URL!" });
  }
  return;
});

app.get("/favicon.ico", (req, res, next) => {
  res.status(200).send();
});

app.get("/login", (req, res, next) => {
  res.status(200).sendFile(path.join(__dirname, "/login.html"));
});
app.get('/logout', (req, res, next)=>{
  req.logout((err)=>{
    if(err){
      return next(err)
    }
    res.redirect('/')
      return
  })
})
app.post("/login", async (req, res, next) => {
  console.log("Login request recieved");
  const { username, password } = req.body;
  console.log(req.body);
  const user = await Users.findOne({ username: username });
  if (!user) {
    res.status(200).json({error:"User not found. Register to create a new account with that username!"});
    return;
  }
  if (!validate(password, user.salt, user.hash)) {
    res.status(200).json({ error: "Wrong Password!" });
    return;
  }
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })(req, res, next);
});

app.get("/register", (req, res, next) => {
  res.status(200).sendFile(path.join(__dirname, "register.html"));
});
app.post("/register", async (req, res, next) => {
  console.log("Register request received");
  const { username, password } = req.body;
  const user = await Users.findOne({ username: username });
  if (user) {
    res.status(200).json({error:"That user already exists! Try logging in, or choose a different username!",});
    return;
  }
  const salthash = generatePass(password);
  const salt = salthash.salt;
  const hash = salthash.hash;
  try {
    await Users.create({
      username: username,
      salt: salt,
      hash: hash,
    });
    res.redirect("/login")
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send("Registration failed"); // Handle error
  }
});
app.get("/:shortened", async (req, res, next) => {
  const { shortened } = req.params;
  try {
    const redirect = await URLS.findOne({ shortened: shortened });
    if (redirect) {
      const redirecturl = redirect.redirect;
      console.log(redirecturl);
      if (redirecturl.startsWith("https://")) {
        res
          .status(200)
          .send(`<script>window.location.href = "${redirecturl}"</script>`);
        return;
      } else {
        res
          .status(200)
          .send(
            `<script>window.location.href = "https://${redirecturl}"</script>`
          );
        return;
      }
    } else {
      res.status(200).send("404!");
      return;
    }
  } catch (error) {
    console.error("Error finding URL:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Started listening on ${port}`);
});
