const togglePassword = document.getElementById('button-addon2')
const passInput = document.getElementById('formGroupExampleInput2')
const userInput = document.getElementById('autoSizingInputGroup')
const msgdiv = document.getElementById('msg')
const register = document.getElementById('register')
register.addEventListener('click', ()=>{
    window.location.href = '/register'
})
togglePassword.addEventListener('click', ()=>{
    
    if(togglePassword.innerHTML == `<i class="fa-regular fa-eye-slash"></i>`){
        togglePassword.innerHTML = `<i class="fa-regular fa-eye"></i>`
        passInput.type = "password"
    } else {
        togglePassword.innerHTML = `<i class="fa-regular fa-eye-slash"></i>`
        passInput.type = "text"
    }
})

const submitbtn = document.getElementById('submitbtn')
submitbtn.addEventListener('click', async()=>{
    const msg = await axios.post('/login', {username: userInput.value, password: passInput.value})
    if (msg.data.error){
        msgdiv.style.display = 'flex';
        msgdiv.textContent = msg.data.error
    }
    console.log(msg)
})

passInput.addEventListener('focus', ()=>{
    msgdiv.style.display = 'none';
})
userInput.addEventListener('focus', ()=>{
    msgdiv.style.display = 'none';
})

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
