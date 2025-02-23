const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()
const atlasUri = process.env.DB_URI; // Replace with your Atlas URI

app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(atlasUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB Atlas!');
})
.catch((err) => {
  console.error('Error connecting to MongoDB Atlas:', err);
});

const Schema = new mongoose.Schema({
  redirect: String,
  shortened: String,
});

const URLS = mongoose.model('urls', Schema);

app.get('/', (req, res, next) => {
  res.status(200).sendFile(path.join(__dirname, './index.html'));
});

function generate(longurl) {
  const salt = crypto.randomBytes(6).toString('hex');
  const hashed = crypto.pbkdf2Sync(longurl, salt, 100, 7, 'sha512').toString('hex');
  return hashed;
}

function isValidUrl(url) {
  if (url.includes(' ') || !url.includes('.') || url === '') {
    return false;
  }
  return true;
}

app.post('/api/shorten', async (req, res, next) => {
  if (isValidUrl(req.body.longurl)) {
    const longUrl = await URLS.findOne({redirect: req.body.longurl.toLowerCase()})
    console.log(longUrl)
    if(longUrl){
        const short = longUrl.shortened
        res.status(200).json({msg: `${req.get('host')}/${short}`})
        return
    }else{
    const shorturl = generate(req.body.longurl);
    try {
      await URLS.create({
        redirect: req.body.longurl,
        shortened: shorturl,
      });

      res.status(200).json({ msg: `${req.get('host')}/${shorturl}` });
    } catch (error) {
      console.error('Error creating URL:', error);
      res.status(500).json({ msg: 'Internal server error' }); // Handle creation error
    }
}
  } else {
    res.status(200).json({ msg: 'Please enter a valid URL!' });
  }
  return;
});

app.get('/favicon.ico', (req, res, next) => {
  res.status(200).send();
});

app.get('/:shortened', async (req, res, next) => {
  const { shortened } = req.params;
  try {
    const redirect = await URLS.findOne({ shortened: shortened });
    if (redirect) {
      const redirecturl = redirect.redirect;
      console.log(redirecturl);
      if (redirecturl.startsWith('https://')) {
        res.status(200).send(`<script>window.location.href = "${redirecturl}"</script>`);
        return;
      } else {
        res.status(200).send(`<script>window.location.href = "https://${redirecturl}"</script>`);
        return;
      }
    } else {
      res.status(200).send('404!');
      return;
    }
  } catch (error) {
    console.error('Error finding URL:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Started listening on ${port}`);
});