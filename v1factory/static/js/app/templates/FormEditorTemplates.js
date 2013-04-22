var FormEditorTemplates = { };

var FieldTypes = {
  "single-line-text" : '<input type="text" placeholder="<%= field.get(\'placeholder\') %>" value="<%= value %>" disabled>',
  "paragraph-text"   : '<textarea placeholder="<%= field.get(\'placeholder\') %>" disabled><%= value %></textarea>',
  "dropdown"         : '<select class="drowdown"><option><%= value %></option><% _(field.get(\'options\')).each(function(option, ind){ %><option><%= option %><% }); %></option>',
  "option-boxes"     : '<span class="option-boxes"><% _(field.get(\'options\')).each(function(option, ind){ %><label for="opt-<%= ind %>"></label><input id="opt-<%= ind %>" class="field-type" type="radio" name="types" value="single-line-text"><%= option %><% }); %></span>',
  "password-text"    : '<input type="password" placeholder="<%= field.get(\'placeholder\') %>">',
  "email-text"       : '<div class="input-prepend"><span class="add-on">@</span><input type="text" placeholder="<%= field.get(\'placeholder\') %>"></div>',
  "button"           : '<div class="btn"><%= field.get(\'placeholder\') %></div>',
  "image-uploader"   : '<input type="file" placeholder="<%= field.get(\'placeholder\') %>">',
  "date-picker"      : 'date picker will be here.<input type="text" placeholder="<%= field.get(\'placeholder\') %>">'
};


FormEditorTemplates.field = [
'<% var value =""; if(form.get(\'action\') == "edit"){ value = "{{" + entity.get(\'name\') + "_" + field.get(\'name\') +"}}"; }%>',
'<li id="field-<%= field.cid %>" class="field-li-item"><label><%= field.get(\'label\') %><br>',
  '<% if(field.get(\'displayType\') == "single-line-text") { %>',
    FieldTypes['single-line-text'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "paragraph-text") { %>',
    FieldTypes['paragraph-text'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "password-text") { %>',
    FieldTypes['password-text'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "email-text") { %>',
    FieldTypes['email-text'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "image-uploader") { %>',
    FieldTypes['image-uploader'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "date-picker") { %>',
    FieldTypes['date-picker'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "button") { %>',
    FieldTypes['button'],
  '<% } %>',
'</label></li>'
].join('\n');


FormEditorTemplates.template = [
  '<h3 class="hi2 full title"><%= form.get("name") %> Form</h3>',
  '<div class="details-panel panel">',
  '</div><div class="form-panel panel">',
    '<h4>How It Looks</h4>',
    '<ul class="form-fields-list">',
      '<li class="new-field"><span class="field-text"> Add a new field</span>',
      '<select class="field-connection" style="display:none;">',
      '<option>Choose the connected field</option>',
      '<% _(entity.get("fields").models).each(function(field) { %>',
      '<option class="field-name-box" value="<%= field.cid %>"><%= field.get(\'name\') %></option>',
      '<% }); %><option value="new-value">Add a new field</option></select><form class="new-value-form" style="display:none;"><input type="text" class="new-field-inp" placeholder="Name of the field..."></form></li>',
      '<% _(form.get(\'fields\').models).each(function(field) { %>',
        FormEditorTemplates.field,
      '<% }); %>',
    '</ul>',
    '<small>You can click on field to see the details and drag them to arrange the display order</small>',
  '</div><div class="action-panel panel">',
    '<h4 class="">Form Actions</h4>',
    '<b>Go to</b>',
    '<select class="goto">',
      '<% _(pages).each(function(page) { %>',
        '<option <% if(form.get("goto") == "{{"+page.name+"}}"){ %> selected<% }; %>><%= page.name %></option>',
      '<% });%>',
    '</select>',
    '<br><b>Email</b>',
    '<select><option>Email 1</option><option>Email 2</option></select>',
  '</div>'
].join('\n');

var fieldTypesArr = {
  "text" : [
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
    },
    {
      text: "Password Text",
      value: "password-text"
    }
  ],

  "email" : [
    {
      text: "Email Box",
      value: "email-text"
    }
  ],

  "number" : [
    {
      text: "Single Line Text",
      value: "single-line-text"
    },
    {
      text: "Dropdown",
      value: "dropdown"
    },
    {
      text: "Option Boxes",
      value: "option-boxes"
    }
  ],

  "button" : [
    {
      text: "Button",
      value: "button"
    }
  ],

  "image" : [
    {
      text: "Image Uploader",
      value: "image-uploader"
    }
  ],

  "date" : [
    {
      text: "Date Picker",
      value: "date-picker"
    }
  ]

};

FormEditorTemplates.details = [
  '<h4>Details of Selected Field</h4>',
  '<label><b>Label</b><br>',
  '<input class="field-label-input" id="field-label-<%= field.cid %>" type="text" placeholder="Field Label..." value="<%= field.get(\'label\') %>">',
  '</label>',
  '<label><b>Placeholder</b><br>',
  '<input class="field-placeholder-input" type="text" id="field-placeholder-<%= field.cid %>" placeholder="Fild Placeholder..." value="<%= field.get(\'placeholder\') %>">',
  '</label>',
  '<ul class="field-types">',
    '<% _(fieldTypesArr[field.get("type")]).each(function(fieldType) { %>',
      '<li><label><input class="field-type" type="radio" name="types" value="<%= fieldType.value %>" <% if(field.get(\'displayType\') == fieldType.value) { %>checked<% } %>><%= fieldType.text %></label></li>',
    '<% }) %>',
  '</ul>'
].join('\n');