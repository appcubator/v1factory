define([
  'backbone',
  'backboneui'
],
function(Backbone, BackboneUI) {
  
  var ShowDataView = BackboneUI.ModalView.extend({
    tagName: 'div',
    className: 'show-data',
    width: 800,
    
    initialize: function(data) {
      console.log(data);
      this.data = data;
      this.render();
    },
    
    render : function(text) {
      var html = "";
      var textData = this.data;
      var schema = textData['schema'];
      var rows = textData['data'];
      html += "<tr>";
      for (var i = 0; i < schema.length; i++) {
	  html += "<th>" + schema[i] + "</th>";
      }
      html += "</tr>";
      for (var i = 0; i < rows.length; i++) {
	  var row = rows[i];
	  html += "<tr>";
	  for (var j = 0; j < row.length; j++) {
	      html += "<td>" + row[j] + "</td>";
	  }
	  html += "</tr>";
      }
      this.el.innerHTML = '<table>' + html + '</table>'
      return this;
    }
  });

  return ShowDataView;
});