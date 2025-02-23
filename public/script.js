const submit = document.getElementById('submit')
document.getElementById('longurl').focus()
submit.addEventListener('click', async()=>{
    const longurl = document.getElementById('longurl').value
    const msg = await axios.post('/api/shorten', {longurl: longurl})
    const resdiv = document.getElementById('result')
    resdiv.style.display = 'flex';
    resdiv.textContent = msg.data.msg
    // console.log(msg.data.msg)
})