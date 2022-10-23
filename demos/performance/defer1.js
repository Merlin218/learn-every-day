function consoleDefer() {
  console.log('defer1')
}
setTimeout(() => {
  consoleDefer()
})
