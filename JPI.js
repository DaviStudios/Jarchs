function addjpi(amnt) {
    if (localStorage.getItem('JPI')) {
        localStorage.setItem('JPI', Number(localStorage.getItem('JPI')) +amnt)
    } else {
        localStorage.setItem('JPI', 50 + amnt)
    }
}

function subjpi(amnt) {
    if (localStorage.getItem('JPI')) {
        localStorage.setItem('JPI', Number(localStorage.getItem('JPI')) -amnt)
    } else {
        localStorage.setItem('JPI', 50 + amnt)
    }
}

function getJPI() {
    return localStorage.getItem('JPI')
}

window.onload = function() {
    if (!localStorage.getItem('JPI')) localStorage.setItem('JPI', 50)
}