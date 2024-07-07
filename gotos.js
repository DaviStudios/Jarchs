function gotos(url) {
    const a = document.createElement('a')
    a.href = url + '.html'
    document.body.appendChild(a)
    a.click()
    a.remove()
}