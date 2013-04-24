PageTemplates = {};

PageTemplates.tempPage = [
  '<h3 class="offset2 hoff2"><%= page_name %></h3>',
  '<div class="page-menu">',
    '<a class="edit item" href="editor/<%= ind %>"><i class="icon-edit"></i>Edit Page</a>',
    '<a class="delete item"><i class="icon-delete"></i>Delete Page</a>',
    '<div class="edit-url item"><i class="icon-url"></i>Edit URL</div>',
  '</div>'
].join('\n');

PageTemplates.tempMenu = [
'<span class="span24 hi4">',
'<h4 class="hi2 span8 hoff1 offset2">Access Level</h4>',
  '<select class="span8 hoff1" id="access_level">',
    '<option <% if(access_level == \'all\') { %> selected <% } %> value="all">Everyone</option>',
    '<option <% if(access_level == \'users\') { %> selected <% } %> value="users">Only Users</option>',
  '</select>',
'</div>'
].join('\n');