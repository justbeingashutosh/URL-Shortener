const submit = document.getElementById('submit')
const inputfield = document.getElementById('longurl')
const resdiv = document.getElementById('result')
inputfield.focus()
submit.addEventListener('click', async()=>{
    const longurl = document.getElementById('longurl').value
    const msg = await axios.post('/api/shorten', {longurl: longurl})
    resdiv.style.display = 'flex';
    resdiv.textContent = msg.data.msg
})
inputfield.addEventListener('focus', ()=>{
    resdiv.style.display = 'none'
})
