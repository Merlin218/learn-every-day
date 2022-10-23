function consoleAsync() {
  console.log('async1')
}
setTimeout(() => {
  consoleAsync()
})
