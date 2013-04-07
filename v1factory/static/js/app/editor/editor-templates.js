var Templates = {};

Templates.tempMeta = [
  '<ul class="meta" style="display:none;">',
    '<li><img class="delete" src="/static/img/delete-icon.png"></li>',
    '<li><img class="delete" src="/static/img/delete-icon.png"></li>',
  '</ul>'
].join('\n');


Templates.tempNode = [
  '<<%= element.tagName %>',
  'class = "<%= element.class_name %>"',
  '<% _(element.cons_attribs).each(function(val, key) { %>',
  '<%=key%> = "<%=val%>"<% }); %>',
  '<% _(element.content_attribs).each(function(val, key) { %>',
  '<%=key%> = "<%=val%>"<% }); %>>',
  '<% if(!element.isSingle) { %>',
  '<%= element.content %>',
  '</<%= element.tagName %>>',
  '<% }; %>'
].join('\n');


Templates.tempLi = [
  '<li id="entity-user-<%= attr %>" class="large single-data">',
  '<span class="name">Show <%= name %> <%= attr %></span></li>'
].join('\n');

Templates.tempLiSingleData = [
  '<li id="entity-<%= cid %>-<%= attr %>" class="large single-data">',
  '<span class="name">Show <%= name %> <%= attr %></span></li>'
].join('\n');

Templates.tempLiEntity = [
  '<li id="entity-<%= cid %>" class="show entity">',
  '<span class="name">List of <%= name %></span></li>'
].join('\n');

Templates.tempLiTable = [
  '<li id="entity-<%= cid %>" class="table-gal entity">',
  '<span class="name"><%= name %> Table</span></li>'
].join('\n');

Templates.tempHrefSelect = [
  '<select class="select-href" id="prop-<%= hash %>">',
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

Templates.createFormButton = [
  '<li id="entity-<%= entity.cid %>-<%= form.cid %>" class="create entity">',
  '<span class="name"><%= form.get(\'name\') %> Form</span></li>'
].join('\n');

Templates.formButton = [
  '<li id="entity-<%= entity.cid %>-<%= form.cid %>" class="<%= form.get(\'action\') %> entity">',
  '<span class="name"><%= form.get(\'name\') %> Form</span></li>'
].join('\n');

var FieldTypes = {
  "single-line-text" : '<input type="text" class="'+ uieState.textInputs[0].class_name +'" placeholder="<%= field.get(\'placeholder\') %>">',
  "paragraph-text"   : '<textarea placeholder="<%= field.get(\'placeholder\') %>"></textarea>',
  "dropdown"         : '<select class="drowdown"><% _(field.get(\'options\')).each(function(option, ind){ %><option><%= option %><% }); %></option>',
  "option-boxes"     : '<span class="option-boxes"><% _(field.get(\'options\')).each(function(option, ind){ %><label for="opt-<%= ind %>"></label><input id="opt-<%= ind %>" class="field-type" type="radio" name="types" value="single-line-text"><%= option %><% }); %></span>',
  "password-text"    : '<input type="password" class="'+ uieState.passwords[0].class_name +'" placeholder="<%= field.get(\'placeholder\') %>">',
  "email-text"       : '<div class="input-prepend"><span class="add-on">@</span><input type="text" class="'+ uieState.textInputs[0].class_name +'" placeholder="<%= field.get(\'placeholder\') %>"></div>',
  "button"           : '<input type="submit" class="btn '+ uieState.buttons[0].class_name +'" value="<%= field.get(\'placeholder\') %>">',
  "image-uploader"   : '<input type="file" placeholder="<%= field.get(\'placeholder\') %>">',
  "date-picker"      : 'date picker will be here.<input type="text" placeholder="<%= field.get(\'placeholder\') %>">'
};

Templates.fieldNode = [
'<label><%= field.get(\'label\') %><br>',
  '<% if(field.get(\'displayType\') == "single-line-text") { %>',
    FieldTypes['single-line-text'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "paragraph-text") { %>',
    FieldTypes['paragraph-text'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "dropdown") { %>',
    FieldTypes['dropdown'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "option-boxes") { %>',
    FieldTypes['option-boxes'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "password-text") { %>',
    FieldTypes['password-text'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "email-text") { %>',
    FieldTypes['email-text'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "button") { %>',
    FieldTypes['button'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "image-uploader") { %>',
    FieldTypes['image-uploader'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "date-picker") { %>',
    FieldTypes['date-picker'],
  '<% } %>',
'</label>'
].join('\n');

Templates.queryView = [
  '<h1 class="title"><%= entity.get(\'name\') %> <% if(c.row) { print(\'List\'); } else { print(\'Table\'); } %></h1>',
  '<hr>',
  '<div class="sect">',
  '<p id="query-description"><%= c.nLang %></p>',
  '</div>',
  '<hr>',
  '<div class="sect">',
  '<p>What fields would you like to display?</p>',

  '<% _.each(entity.get("fields").models, function(field) { %>',
    '<% var checked = \'\'; var u_id = field.cid; if(_.contains(query.get(\'fieldsToDisplay\'), field.get(\'name\'))) { checked = \'checked\'; } %>',
    '<label><input class="fields-to-display btn" id="field-<%= field.cid %>" type="checkbox" value="<%= field.get(\'name\') %>" <%= checked %>><%= field.get(\'name\') %></label>',
  '<% }) %>',
  '</div>',
  '<hr>',
    '<div class="sect">',
    '<% var checked = (query.get(\'belongsToUser\') === false)? "checked" : \'\' %>',
    '<p>Do you want to show the rows that just belong to the logged in user?</p>',
    '<label><input type="radio" class="belongs-to-user" name="belongsTo" value="true" checked> Yes</label>',
    '<label><input type="radio" class="belongs-to-user" name="belongsTo" value="false"<%= checked %>> No</label>',
    '</div>',
    '<hr>',
    '<div class="sect">',
    '<p>How do you want to sort the rows?</p>',
    '<select class="sort-by">',
    '<option id="by-date">According to the date created</option>',
    '<% _.each(entity.get("fields").models, function(field) { %>',
      '<% var selected = "";  if("by-" + field.get("name") == query.get("sortAccordingTo")) selected = "selected" %>',
      '<option value="by-<%=field.get("name")%>" <%= selected %>>Alphabetically according to <%= field.get("name") %></option>',
    '<% }); %>',
    '</select>',
    '</div>',
    '<hr>',
    '<div class="sect">',
    '<p>How many rows would you like to show?</p>',
    '<label><input type="radio" class="nmr-rows" id="all-rows" name="nmrRows" value="All" <%= c.rAll %>> All</label>',
    '<label><input type="radio" class="nmr-rows" id="first-rows" name="nmrRows" value="First" <%= c.rFirst %>> First <input type="text" id="first-nmr" value="<%= c.rFirstNmr %>"> rows</label>',
    '<label><input type="radio" class="nmr-rows" id="last-rows" name="nmrRows" value="Last" <%= c.rLast %>> Last <input type="text" id="last-nmr" value="<%= c.rLastNmr %>"> rows</label>',
    '</div>',
    '<hr>'
].join('\n');

Templates.listEditorView = [
  '<span class="view-type-list type-pick"></span><span class="view-tyle-grid type-pick"></span>',
  '<div class="editor-window">',
  '</div>'
].join('\n');


Templates.tempUIElement = [
  '<<%= element.get(\'tagName\') %>',
  'class = "<%= element.get(\'class_name\') %>"',
  '<% if(element.get(\'cons_attribs\')) { %>',
  '<% _(element.get(\'cons_attribs\').attributes).each(function(val, key) { %>',
  '<%=key%> = "<%=val%>"<% }); %>',
  '<% } %>',
  '<% _(element.get(\'content_attribs\').attributes).each(function(val, key) { %>',
  '<%=key%> = "<%=val%>"<% }); %>>',
  '<% if(!element.get(\'isSingle\')) { %>',
  '<%= element.get(\'content\') %>',
  '</<%= element.get(\'tagName\') %>>',
  '<% }; %>'
].join('\n');


Templates.tempUIElementSized = [
  '<<%= element.get(\'tagName\') %>',
  'class = "span<%=element.get(\'layout\').get(\'width\')%> hi<%=element.get(\'layout\').get(\'height\')%> <%= element.get(\'class_name\') %>"',
  '<% if(element.get(\'cons_attribs\')) { %>',
  '<% _(element.get(\'cons_attribs\').attributes).each(function(val, key) { %>',
  '<%=key%> = "<%=val%>"<% }); %>',
  '<% } %>',
  '<% _(element.get(\'content_attribs\').attributes).each(function(val, key) { %>',
  '<%=key%> = "<%=val%>"<% }); %> style="position:absolute; top:<%=element.get(\'layout\').get(\'top\') * 15%>px; left:<%=element.get(\'layout\').get(\'left\')*80%>px;">',
  '<% if(!element.get(\'isSingle\')) { %>',
  '<%= element.get(\'content\') %>',
  '</<%= element.get(\'tagName\') %>>',
  '<% }; %>'
].join('\n');

Templates.rowNode = [
  '<div class="span<%= layout.get(\'width\') %> hi<%= layout.get(\'height\') %>" style="position:relative;">',
    '<% _(uielements).each(function(element){ %>',
      Templates.tempUIElementSized,
    '<% }); %>',
  '</div>'
].join('\n');

Templates.listNode = [
  '<div>',
    Templates.rowNode,
    Templates.rowNode,
    Templates.rowNode,
    Templates.rowNode,
  '</div>'
].join('\n');

