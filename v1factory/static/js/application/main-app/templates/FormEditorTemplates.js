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
  "date-picker"      : '<input type="text" style="width:40px;" placeholder="mm">/<input type="text" style="width:40px;" placeholder="dd">/<input type="text" style="width:60px;" placeholder="yyyy">'
};


FormEditorTemplates.field = [
'<li id="field-<%= field.cid %>" class="field-li-item sortable li-<%= field.get(\'displayType\')%>"><label><%= field.get(\'label\') %></label><span class="form-item">',
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
  '<% if(field.get(\'displayType\') == "option-boxes") { %>',
    FieldTypes['option-boxes'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "dropdown") { %>',
    FieldTypes['dropdown'],
  '<% } %>',
'</span><span class="drag-icon"></span><span class="delete-field" id="delete-btn-field-<%= field.cid %>">Delete Field</span></li>'
].join('\n');

FormEditorTemplates.possibleActions = [
  '<% _(pages).each(function(page) {  %>',
    '<li class="action page-redirect" id="page-<%= page.cid %>">Go to <%= page.get("name") %><div class="add-to-list"></div></li>',
  '<% });%>'
].join('\n');

FormEditorTemplates.template = [
  '<h4 class="form-editor-title">Form Editor</h4><h4 class="form-action-title">Actions on form submission</h4>',
  '<div class="details-panel panel">',
  '</div><div class="form-panel panel">',
    '<small>You can click on field to see the details and drag them to arrange the display order</small>',
    '<ul class="form-fields-list">',
    '</ul>',
      '<% var field = _.last(form.get(\'fields\').models); var sortable = "not-sortable"; %>',
        FormEditorTemplates.field,
      '<% %>',
  '</div><div class="action-panel panel">',
    '<small>Choose options from the list below.</small>',
    '<ul class="current-actions"></ul>',
    '<div class="section-header">Options</div>',
    '<ul class="action goto-list">',
      FormEditorTemplates.possibleActions,
    '</ul>',
  '</div>',
  '<div class="bottom-sect"><div class="q-mark"></div><div class="btn done-btn">Done</div></div>'
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
  '<label><b>Label</b><br>',
  '<input class="field-label-input" id="field-label-<%= field.cid %>" type="text" placeholder="Field Label..." value="<%= field.get(\'label\') %>">',
  '</label>',
  '<label><b>Placeholder</b><br>',
  '<input class="field-placeholder-input" type="text" id="field-placeholder-<%= field.cid %>" placeholder="Fild Placeholder..." value="<%= field.get(\'placeholder\') %>">',
  '</label>',
  '<label><b>Display Type</b>',
    '<ul class="field-types">',
    '<% _(fieldTypesArr[field.get("type")]).each(function(fieldType) { %>',
      '<li><label><input class="field-type" type="radio" name="types" value="<%= fieldType.value %>" <% if(field.get(\'displayType\') == fieldType.value) { var checked = true; %>checked<% } %>><%= fieldType.text %></label></li>',
    '<% }) %>',
  '</ul></label>',
  '<label class="options-list"></label>'
].join('\n');