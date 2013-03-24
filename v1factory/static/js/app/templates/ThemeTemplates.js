var ThemeTemplates = {};

ThemeTemplates.tempNode = [
  '<div class="element-node">',
  '<<%= info.tagName %>',
  '<% _(info.cons_attribs).each(function(val, key){ %>',
  '<%= key %> = <%= val %>',
  '<% }); %><% _(info.content_attribs).each(function(val, key){ %>',
  '<%= key %> = <%= val %>',
  '<% }); %> style="<%= info.style %>">',
  '<% if(!info.isSingle) { %>',
  '<%= info.content %></<%=info.tagName%>>',
  '<% } %>',
  '</div>'
].join('\n');

ThemeTemplates.tempPane = [
'<form class="element-create-form">',
  '<input type="text" name="className" class="class_name" value="<%= info.class_name %>" placeholder="Class Name...">',
  '<textarea name="style" class="style" placeholder="Styling here..."><%= info.style %></textarea>',
  '<input type="submit" value="Done" class="btn">',
'</form>'
].join('\n');

ThemeTemplates.tempCreate = [
'<div class="span9 hoff1 create-text">',
  '<div class="pane border minhi">',
    '<span class="">+ Create an element</span>',
  '</div>',
'</div>'
].join('\n');
