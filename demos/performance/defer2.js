function consoleDefer() {
  console.log('defer2')
}
setTimeout(() => {
  consoleDefer()
})
