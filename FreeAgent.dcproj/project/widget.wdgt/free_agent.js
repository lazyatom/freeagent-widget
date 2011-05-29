FreeAgent = {
  projects: [],
  tasks: [],
  currentProject: null,
  email: null,
  password: null,
  domain: null,
  userID: null,

  prepare: function() {
    this.userID = null;
    if (this.domain == "" || this.email == "" || this.password == "") {
      GUI.promptForDetails();
    } else {
      this.loadUser();
      this.loadProjects();
    }
  },

  getXMLData: function(xml, kind, checkFunction) {
    var results = [];
    var things = xml.find(kind);
    if (things.length == 0) {
      Logger.log("Found no " + kind + "s");
    } else {
      things.each(function() {
        var thing = $(this);
        if (checkFunction == null || checkFunction(thing)) {
          var thing_id = thing.find("id").text();
          var thing_name = thing.find("name").text();
          Logger.log("adding " + kind + " '" + thing_name + "'");
          results.push({name:thing_name, id:thing_id});
        }
      });
    }
    return results;
  },
  
  loadUser: function() {
    var response = this.ajax({
      url: this.remoteUrl("verify"),
      success: function(xml, status) {
        FreeAgent.userID = response.getAllResponseHeaders().split("\n")[0].trim().split(":")[1].trim();
        Logger.log("User ID: " + FreeAgent.userID);
      }
    });
  },
  
  setProject: function(projectID) {
    $(this.projects).each(function() {
      if (this.id == projectID) {
        FreeAgent.currentProject = this;
        return;
      }
    });
    FreeAgent.loadTasks();
  },
  
  setTask: function(taskID) {
    $(this.tasks).each(function() {
      if (this.id == taskID) {
        FreeAgent.currentTask = this;
        return;
      }
    });
  },
  
  loadProjects: function(event) {
    this.currentTask = null;
    this.tasks = [];
    this.loadXML("projects", function(xml) {
      FreeAgent.projects = FreeAgent.getXMLData(xml, "project", function(project) { return project.find("status").text() == "Active"; });
      FreeAgent.currentProject = FreeAgent.projects[0];
      GUI.updateProjects(FreeAgent.projects, FreeAgent.currentProject);
      FreeAgent.loadTasks();
    });
  },
  
  loadTasks: function(event) {
    if (this.currentProject == undefined) { return; }
    this.loadXML("projects/" + FreeAgent.currentProject.id + "/tasks", function(xml) {
      FreeAgent.tasks = FreeAgent.getXMLData(xml, "task");
      FreeAgent.currentTask = FreeAgent.tasks[0];
      GUI.updateTasks(FreeAgent.tasks, FreeAgent.currentTask);
    });
  },
  
  newTask: function(taskName) {
    this.tasks.unshift({name:taskName, id:'new'});
    this.currentTask = this.tasks[0];
    GUI.updateTasks(this.tasks, this.currentTask);
  }, 
  
  /* options = {
      duration, comment, project_id,
      task_id, // or
      task, new_task } 
  */
  postTime: function(options) {
    if (options.timer.duration < 60) { 
      return; // less than a minute! 
    }
    var remoteUrl = this.remoteUrl("timeslips");
    var now = new Date();
    var timeslipXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><timeslip>" + 
                      "<dated-on>" + now.toISOString() + "</dated-on>" + 
                      "<user-id>" + this.userID + "</user-id>" +
                      "<project-id type='integer'>" + this.currentProject.id + "</project-id>" +
                      "<hours>" + options.timer.asHours() + "</hours>" + 
                      "<comment><![CDATA[" + options.comment + "]]></comment>";
    // set the task
    if (this.currentTask.id == 'new') {
      timeslipXML += "<new-task><![CDATA["+ this.currentTask.name + "]]></new-task>";
    } else {
      timeslipXML += "<task-id>" + this.currentTask.id + "</task-id>";
    }
    timeslipXML += "</timeslip>";
    
    console.log("xml: " + timeslipXML);
    
    this.ajax({
      type: 'POST',
      url: remoteUrl,
      data: timeslipXML,
      filterData: function(data, type) {
        if (data == "") { // looks like FreeAgent returns nothing.
          return "<?xml version=\"1.0\" encoding=\"UTF-8\"?><empty></empty>";
        }
      },
      success: function(xml, status) {
        GUI.showPosted();
        Timer.reset();
      },
      error: function(xml, status) {
        console.log("Error: " + xml.responseText);
      }
    }); 
  },
  
  loadXML: function(resource, callback) {
    this.ajax({
      url: this.remoteUrl(resource),
      success: function(xml, status) {
        Logger.log(FreeAgent.remoteUrl(resource) + " returned " + xml + " [status: " + status + "]");
        callback($(xml));
      }
    });
  },
  
  remoteUrl: function(resource, paramString) {
    var url = "https://" + this.domain + ".freeagentcentral.com/" + resource;
    if (paramString != undefined) { 
      url += ("?" + paramString); 
    }
    return url;
  },
  
  ajax: function(options) {
    Logger.log("loading from " + options.url);
    return $.ajax($.extend({
      contentType: "application/xml",
      dataType: "xml",
      beforeSend : function(req) {
        req.setRequestHeader('Authorization', FreeAgent._basicAuthentication());
      },
      // debug
      error: function(xml, status, error) {
        Logger.log("xml: " + xml.responseText);
        Logger.log("error status: " + status);
        Logger.log("error: " + error);
      }
    }, options));
  },
  _basicAuthentication: function() {
    var tok = this.email + ':' + this.password;
    var hash = $.base64Encode(tok);
    return "Basic " + hash;
  }
} 
