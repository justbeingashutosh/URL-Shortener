const submit = document.getElementById('submit')
const inputfield = document.getElementById('longurl')
const resdiv = document.getElementById('result')
const resdivContainer = document.getElementById('bottom')
const copybtn = document.getElementById("copy")
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
    }
})
inputfield.addEventListener('focus', ()=>{
    resdivContainer.style.display = 'none'
})

copybtn.addEventListener('click', ()=>{
    navigator.clipboard.writeText(resdiv.textContent)
})

const loginbtn = document.getElementById('login')
loginbtn.addEventListener('click', ()=>{
    window.location.href = '/login'
})

const togglePassword = document.getElementById('button-addon2')
const passInput = document.getElementById('formGroupExampleInput2')
togglePassword.addEventListener('click', ()=>{
    passInput.type = "text"
    togglePassword.innerHTML = `<i class="fa-regular fa-eye-slash"></i>`
})

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))








