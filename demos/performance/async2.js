function consoleAsync() {
  console.log('async2')
}
setTimeout(() => {
  consoleAsync()
})
