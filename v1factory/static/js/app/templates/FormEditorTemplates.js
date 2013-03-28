var FormEditorTemplates = { };

var FieldTypes = {
  "single-line-text" : '<input type="text" placeholder="<%= field.get(\'placeholder\') %>">',
  "paragraph-text"   : '<textarea placeholder="<%= field.get(\'placeholder\') %>"></textarea>',
  "dropdown"         : '<select class="drowdown"><% _(field.get(\'options\')).each(function(option, ind){ %><option><%= option %><% }); %></option>',
  "option-boxes"     : '<span class="option-boxes"><% _(field.get(\'options\')).each(function(option, ind){ %><label for="opt-<%= ind %>"></label><input id="opt-<%= ind %>" class="field-type" type="radio" name="types" value="single-line-text"><%= option %><% }); %></span>',
  "password-text"    : '<input type="password" placeholder="<%= field.get(\'placeholder\') %>">',
  "email-text"       : '<div class="input-prepend"><span class="add-on">@</span><input type="text" placeholder="<%= field.get(\'placeholder\') %>"></div>',
  "button"           : '<div class="btn"><%= field.get(\'placeholder\') %></div>'
};


FormEditorTemplates.field = [
'<li id="field-<%= field.cid %>" class="field-li-item"><label><%= field.get(\'label\') %><br>',
  '<% if(field.get(\'type\') == "single-line-text") { %>',
    FieldTypes['single-line-text'],
  '<% } %>',
  '<% if(field.get(\'type\') == "paragraph-text") { %>',
    FieldTypes['paragraph-text'],
  '<% } %>',
  '<% if(field.get(\'type\') == "password-text") { %>',
    FieldTypes['password-text'],
  '<% } %>',
  '<% if(field.get(\'type\') == "email-text") { %>',
    FieldTypes['email-text'],
  '<% } %>',
    '<% if(field.get(\'type\') == "button") { %>',
    FieldTypes['button'],
  '<% } %>',
'</label></li>'
].join('\n');


FormEditorTemplates.template = [
  '<div class="fields-panel panel">',
    '<h3 class="hi2"><%= form.get("name") %></h3>',
    '<h4>Fields</h4>',
    '<% _(entity.get("fields").models).each(function(field) { %>',
      '<label><input type="checkbox" class="field-name-box" value="<%= field.get(\'name\') %>" <% console.log(form.get(\'fields\').filter(function(d){ return d.get(\'name\') == field.get(\'name\')})); if(form.get(\'fields\').filter(function(d){ return d.get(\'name\') == field.get(\'name\')}).length > 0) { %> checked <% }; %>><%= field.get(\'name\') %></label>',
    '<% }); %>',
  '</div><div class="details-panel panel">',
  '</div><div class="form-panel panel">',
    '<ul class="form-fields-list">',
      '<% _(form.get(\'fields\').models).each(function(field) { console.log("sdf") %>',
        FormEditorTemplates.field,
      '<% }); %>',
    '</ul>',
  '</div><div class="action-panel panel">',
    '<h4>Form Actions</h4>',
    '<span>Go to</span>',
    '<select><option>Page 1</option><option>Page 2</option></select>',
    '<br><span>Email</span>',
    '<select><option>Email 1</option><option>Email 2</option></select>',
  '</div>'
].join('\n');

var fieldTypesArr = [
  {
    text: "Single Line Text",
    value: "single-line-text"
  },
  {
    text: "Paragraph Text",
    value: "paragraph-text"
  },
  {
    text: "Dropdown",
    value: "dropdown"
  },
  {
    text: "Option Boxes",
    value: "option-boxes"
  }
];

FormEditorTemplates.details = [
  '<h4>Field Details</h4>',
  '<label>Label<br>',
  '<input class="field-label-input" id="field-label-<%= field.cid %>" type="text" placeholder="Field Label..." value="<%= field.get(\'label\') %>">',
  '</label><br>',
  '<label>Placeholder<br>',
  '<input class="field-placeholder-input" type="text" id="field-placeholder-<%= field.cid %>" placeholder="Fild Placeholder..." value="<%= field.get(\'placeholder\') %>">',
  '</label><br>',
  '<ul class="field-types">',
    '<% _(fieldTypesArr).each(function(fieldType) { %>',
      '<li><label><input class="field-type" type="radio" name="types" value="<%= fieldType.value %>" <% if(field.get(\'type\') == fieldType.value) { %>checked<% } %>><%= fieldType.text %></label></li>',
    '<% }) %>',
  '</ul>'
].join('\n');