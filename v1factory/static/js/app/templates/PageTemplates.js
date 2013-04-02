PageTemplates = {};

PageTemplates.tempPage = [
  '<div class="span20">',
    '<h3 class="offset2  hoff2"><%= page_name %></h3>',
    '<div class="offset2 hoff1 offsetr1 row">',
      '<a class="edit span16 btn hoff1" href="editor/<%= ind %>">Edit Page</a>',
      '<a class="delete span16 btn hoff1">Delete Page</a>',
    '</div>',
  '</div>',
  '<div class="span20 offset1">',
    '<div class="btn edit-url offset1 span16 hoff1">Edit URL</div>',
  '</div>'
].join('\n');

PageTemplates.tempMenu = [
'<span class="span24 hi6">',
'<h3 class="hi2 span18 hoff1 offset2">Access Level</h3>',
'<div class="offset2">',
  '<select class="span16" id="access_level">',
    '<option <% if(access_level == \'all\') { %> selected <% } %> value="all">Everyone</option>',
    '<option <% if(access_level == \'users\') { %> selected <% } %> value="users">Only Users</option>',
  '</select>',
'</div>',
'</div>'
].join('\n');