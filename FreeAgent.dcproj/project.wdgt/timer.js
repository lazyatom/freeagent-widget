Timer = {
  duration: 0,
  
  toggle: function() {
    return (this.running ? this.stop() : this.start());
  },
  start: function() {
    this.running = true;
    setTimeout(this._increment, 1000);
    this._updateGUI();
    return true;
  },
  stop: function() {
    this.stopping = true;
    return false;
  },
  reset: function() {
    Timer.duration = 0;
    Timer.stop();
    Timer._storeDuration();
    Timer._updateGUI();
  },
  asHours: function() {
    return this.duration / (60 * 60);
  },
  
  parse: function(val) {
    var result = null;
    if (result = /^(\d+)[m]?$/.exec(val)) {
      // if it's just a number, treat it as minutes
      this.duration = result[1] * 60;
    } else if (result = /^(\d+)([h\:](\d+)[m]?)?$/.exec(val)) {
      // if it has an h, or : in it, treat the RHS as hours
      this.duration = (result[1] * 60 * 60) + (result[3] * 60);
    }
    this._updateGUI();
  },
  
  
  // private stuff
  running: false,
  stopping: false,
  _increment: function() {
    if (Timer.running) {
      if (Timer.stopping) {
        Timer.stopping = false;
        Timer.running = false;
        Timer._updateGUI();
      } else {
        Timer.duration += 1;
        setTimeout(Timer._increment, 1000);
      }
      GUI.updateDuration(Timer.duration);
      Timer._storeDuration();
    }
  },
  _storeDuration: function() {
    widget.setPreferenceForKey(this.duration, "unposted-time");
  },
  _updateGUI: function() {
    (this.running && !this.stopping) ? GUI.showRunning() : GUI.showStopped();
    GUI.updateDuration(this.duration);
  }
};