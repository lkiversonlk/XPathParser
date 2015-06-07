window.alert("this is a test!");

show_open = function(){
  window.alert("new web opened!");  
};

gBrowser.addEventListener("load", show_open, true);