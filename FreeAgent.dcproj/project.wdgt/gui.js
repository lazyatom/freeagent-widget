GUI = {
  prepare: function(duration) {
    $("#newTaskBox").hide();
    $("#posted").hide();
    $("#customTime").hide();
    this.updateDuration(duration);
  },
  
  updateDuration: function(duration) {
    this.displayTime(duration);
    if (duration >= 60) {
      this.enablePost();
    } else {
      this.disablePost();
    }
  },
  
  showPosted: function() {
    $("#posted").show();
    var itemToFadeOut = document.getElementById("posted");
    var fadeHandler = function(a, c, s, f){ itemToFadeOut.style.opacity = c; };
    new AppleAnimator(2000, 13, 1.0, 0.0, fadeHandler).start();
  },
  
  displayTime: function(duration) {
    var hours = Math.floor(duration / (60*60));
    var remainder = duration % (60 * 60);
    var minutes = Math.floor((duration - (hours * 60 * 60)) / 60);
    var seconds = (duration % 60);
    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    // somewhat arcane.
    this.buttonText().text(hours + ":" + minutes + ":" + seconds);
  },
  
  enablePost: function() {
    $($("#post div")[2]).css("color", "#000");
  },
  
  disablePost: function() {
    $($("#post div")[2]).css("color", "#666");
  },
  
  buttonText: function() {
    return $($("#time div")[2]);
  },
  
  showRunning: function() {
    this.buttonText().css("color", "#060");
  },
  
  showStopped: function() {
    this.buttonText().css("color", "#000");
  },
  
  alert: function(message) {
    $("#message").text(message);
  },
  
  selectedProjectID: function() {
    return $("#projects").val();
  },
  
  selectedTaskID: function() {
    return $("#tasks").val();
  },
  
  addNewTask: function() {
    $("#newTaskBox").show();
    $("#newTaskName").focus();
  },
  
  selectProject: function(event) {
    FreeAgent.setProject(this.selectedProjectID());
  },
  
  selectTask: function(event) {
    if (this.selectedTaskID() == -1) {
      this.addNewTask();
    } else {
      FreeAgent.setTask(this.selectedTaskID());
    }
  },
  
  updateProjects: function(projects, selected) { 
    this.populateSelect("#projects", projects, selected) 
  },
  
  updateTasks: function(tasks, selected) { 
    this.populateSelect("#tasks", tasks, selected)
    $("#tasks").append("<option value=\"-1\">New Task...</option>");
  },
  
  populateSelect: function(domId, objects, selected) {
    $(domId).html("");
    if (objects.length == 0) {
      $(domId).append("<option value=''></option>");
    } else {
      $(objects).each(function() {
        $(domId).append("<option value=" + this.id + ">" + this.name + "</option>"); 
      });
      $(domId).val(selected.id);
    }
  },
  
  showConfiguration: function() {
    $("#domain").val(FreeAgent.domain);
    $("#email").val(FreeAgent.email);
    $("#password").val(FreeAgent.password);
  },
  
  storeConfiguration: function() {
    FreeAgent.domain = $("#domain").val();
    FreeAgent.email = $("#email").val();
    FreeAgent.password = $("#password").val();
  },
  
  promptForDetails: function() {
    this.alert("Please supply your details");
    showBack();
  }
};
