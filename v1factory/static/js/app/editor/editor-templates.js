var Templates = {};

Templates.tempMeta = [
  '<ul class="meta" style="display:none;">',
    '<li><img class="delete" src="/static/img/delete-icon.png"></li>',
    '<li><img class="delete" src="/static/img/delete-icon.png"></li>',
  '</ul>'
].join('\n');


Templates.tempNode = [
  '<<%= element.tagName %> <% if(element.tagType) { %>type ="<%= element.tagType %>" <% }; %>',
  'class = "<%= element.class_name %>"',
  '<% _(element.content_attribs).each(function(val, key) { %>',
  '<%=key%> = "<%=val%>"<% }); %>>',
  '<% if(!element.isSingle) { %>',
  '<%= element.content %>',
  '</<%= element.tagName %>>',
  '<% }; %>'
].join('\n');


Templates.tempHrefSelect = [
  '<select class="<%= hash %>" id="prop-<%= hash %>">',
  "<% _(appState.pages).each(function(page){ var b = ''; if(('{{'+page.name+'}}') == val){ b = 'selected';}%>",
  '<option value="{{<%= page.name %>}}" <%= b %>><%= page.name %></option>',
  '<%  }) %>',
  '</select>'
].join('\n');


Templates.tempSourceSelect = [
  '<select class="statics"  id="prop-<%= hash %>">',
  '<option class="upload-image">Placeholder</option>',
  "<% _(statics).each(function(asset){ var b = ''; if(asset == val){ b = 'selected';} %>",
  '<option value="<%= asset.url %>" <%= b %>><%= asset.name %></option>',
  '<%  }) %>',
  '<option class="upload-image" value="upload-image">+ Upload an image</option>',
  '</select>'
].join('\n');

Templates.tableNode = [
  '<table class="table table-bordered">',
    '<tr><% _(fieldsToDisplay).each(function(field) { %> <td><%= field %></td> <% }); %></tr>',
    '<tr><% _(fieldsToDisplay).each(function(field) { %> <td><i><%= field %>Data</i></td> <% }); %></tr>',
    '<tr><% _(fieldsToDisplay).each(function(field) { %> <td><i><%= field %>Data</i></td> <% }); %></tr>',
    '<tr><% _(fieldsToDisplay).each(function(field) { %> <td><i><%= field %>Data</i></td> <% }); %></tr>',
    '<tr><% _(fieldsToDisplay).each(function(field) { %> <td><i><%= field %>Data</i></td> <% }); %></tr>',
  '</table>'
].join('\n');