Logger = {
  on: false,
  
  toggle: function() {
    return (this.on = !this.on);
  },
  
  log: function(message) {
    if (Logger.on) {
      alert(message);
    }
  }
}