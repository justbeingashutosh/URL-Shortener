const submit = document.getElementById('submit')
const inputfield = document.getElementById('longurl')
const resdiv = document.getElementById('result')
const resdivContainer = document.getElementById('bottom')
const copybtn = document.getElementById("copy")
const history = document.querySelector('.history')
inputfield.focus()
submit.addEventListener('click', async()=>{
    const longurl = document.getElementById('longurl').value
    const msg = await axios.post('/api/shorten', {longurl: longurl})
    resdiv.textContent = msg.data.msg
    if(msg.data.msg === "Please enter a valid URL!"){
    resdivContainer.style.display = 'flex';
    copybtn.style.display = 'none'
    }else{
    resdivContainer.style.display = 'flex';
    copybtn.style.display = 'block'
    history.prepend(createCard(longurl, msg.data.msg, msg.data.env))
    }
})
inputfield.addEventListener('focus', ()=>{
    resdivContainer.style.display = 'none'
})

copybtn.addEventListener('click', ()=>{
    navigator.clipboard.writeText(resdiv.textContent)
})

const logoutbtn = document.getElementById('logout')
logoutbtn.addEventListener('click', ()=>{
    window.location.href = '/logout'
})

function redirect(url){
    window.location.href = url
}


function createCard(longurl, shorturl, env){
    let longURL = longurl.replace(',', '.')
    let faviconsrc = `https://${longURL}/favicon.ico`
    let shortURL = `${env}/${shorturl}`
    const card = document.createElement('div')
    card.classList.add('cardilac')

    console.log(longURL)
    card.innerHTML = `
    <img src=${faviconsrc} class=redirectFavicon/>
    <p onclick="redirect('https://${longURL}')" class=shorturl>${shortURL}</p>
    <p onclick="redirect('https://${longURL}') style="display:block" class=longurl>${longURL.slice(0, 10)}...</p>
    `
    return card
}

window.addEventListener('load', async()=>{
    const msg = await axios.get(`${window.location.href}/userdata`)
    const historyurls = msg.data.history
    const env = msg.data.env
    for(let url in historyurls){
        const card = createCard(url, historyurls[url], env)
        history.prepend(card)
        // console.log(url, historyurls[url])
    }
    // console.log(msg.data)
})

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))








