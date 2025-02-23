const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const crypto = require('crypto')
const app = express()
const port = 5000 || process.env.PORT

app.use(express.static('./public'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

const connection = mongoose.createConnection('mongodb://127.0.0.1:27017/urldb', {useNewUrlParser: true, useUnifiedTopology: true})

const Schema = {
    redirect: String,
    shortened: String
}

const URLS = connection.model('urls', Schema)

app.get('/', (req, res, next)=>{
    res.status(200).sendFile(path.join(__dirname, './index.html'))
})

function generate(longurl){
    const salt = crypto.randomBytes(6).toString('hex')
    const hashed = crypto.pbkdf2Sync(longurl, salt, 100, 10, 'sha512').toString('hex')
    return hashed
}

app.post('/api/shorten', (req, res, next)=>{
    const shorturl = generate(req.body.longurl)
    URLS.create({
        redirect: req.body.longurl,
        shortened: shorturl
    })
    res.status(200).json({msg: `localhost:5000/${shorturl}`})
    return
})

app.get('/favicon.ico',(req, res, next)=>{
    res.status(200).send()
})

app.get('/:shortened', async(req, res, next)=>{
    const {shortened} = req.params
    const redirect = await URLS.findOne({shortened: shortened})
    if(redirect){
    const redirecturl = redirect.redirect
    console.log(redirecturl)
    if(redirecturl.startsWith("https://")){
    res.status(200).send(`<script>window.location.href = "${redirecturl}"</script>`)
    return
    }else{
    res.status(200).send(`<script>window.location.href = "https://${redirecturl}"</script>`)
    return
    }
    }else{
        res.status(200).send("404!")
        return
    }
})

app.listen(port, ()=>{console.log(`Started listening on ${port}`)})