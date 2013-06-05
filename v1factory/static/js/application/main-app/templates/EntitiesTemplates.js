var EntitiesTemplates = {};

EntitiesTemplates.Form = [
  '<div class="span10 hi9 offsetr1 form-pane" id="form-<%= form.cid %>">',
    '<div class="hi3 hdr"><%= form.get("name") %></div>',
    '<div class="hi2 edit-form btn span8" id="edit-<%- form.cid %>">Edit Form</div>',
    '<div class="hi2 remove-form btn span8" id="remove-<%- form.cid %>">Remove</div>',
  '</div>'
].join('\n');

EntitiesTemplates.Entity = [
  '<div class="row hoff2">',
    '<div class="span58 entity-pane pane">',
      '<div class="" style="padding:0; padding-bottom: 20px;">',
        '<div style="display:inline-block">',
        '<div class="offset2 hoff2 span36">',
          '<h2><%- name %></h2>',
        '</div>',
        '<span class="span19 right hoff1">',
          '<span class="span5 hi5 excel right-icon show-data">',
            '<span class="icon"></span>',
            '<span>See Data</span>',
          '</span>',
          '<span class="span5 hi5 excel right-icon offset1">',
            '<span class="icon"></span>',
            '<span class="upload-excel hi4">Upload Excel</span>',
          '</span>',
          '<span class="span5 hi5 delete right-icon offset1">',
            '<span class="icon"></span>',
            '<span>Delete</span>',
          '</span>',
        '</span>',
        '</div>',
        '<hr style="display:block;">',
        '<div class="description">',
        '<h3 class="offset2 hoff1 span14">Description</h3>',
        '<span class="tbl-wrapper span58 hoff1">',
          '<span class="tbl">',
            '<div class="column">',
              '<div class="hi3 hdr">Property</div>',
              '<div class="hi3 desc">Type</div>',
              '<div class="hi2 desc">Is Required?</div>',
            '</div>',
            '<ul class="property-list">',
            '<% _(attribs).each(function(attrib, ind){ %>',
              '<div class="column" id="column-<%= attrib.cid %>">',
                  '<div class="hi3 hdr"><%- attrib.get(\'name\') %></div>',
                  '<div class="hi3">',
                      '<select class="attribs" id="type-<%= attrib.cid %>">',
                        '<option value="text" <% if(attrib.get("type")=="text") %> selected <% %>>Text</option>',
                        '<option value="number" <% if(attrib.get("type")=="number") {%> selected <% };%>>Number</option>',
                        '<option value="email" <% if(attrib.get("type")=="email") %> selected <% %>>Email</option>',
                        '<option value="image" <% if(attrib.get("type")=="image") %> selected <% %>>Image</option>',
                        '<option value="file" <% if(attrib.get("type")=="file") %> selected <% %>>File</option>',
                        '<option value="date" <% if(attrib.get("type")=="date") %> selected <% %>>Date</option>',
                        '<% _.each( entities, function( model ){ %>',
                          "<% if(model.get('name')!= name) %>",
                          "<option value=\"{{<%- model.get('name') %>}}\" <% if(attrib.get('type') == '{{'+ model.get(\"name\") +'}}') %> selected <% %> >List of <%- model.get('name') %>s</option>",
                        "<% }); %>",
                      '</select>',
                  '</div>',
                  '<div class="hi2"><input class="attrib-required-check" id="checkbox-field-<%= attrib.cid %>" type="checkbox" <% if(attrib.get(\'required\')) { print("checked"); }; %>></div>',
                  '<div class="hi2 prop-cross" id="delete-<%- attrib.cid %>"><div class="remove">Remove</div></div>',
              '</div>',
            '<% }); %>',
            '</ul><a class="column span8 add-property-column" style="float:none;">',
              '<form class="add-property-form" style="display:none">',
                '<div class="hi2 hdr">',
                  '<input type="text" class="property-name-input span7" placeholder="Property Name...">',
                '</div>',
              '</form>',
              '<span class="add-property-button"><span class="plus-icon"></span>Add Property</span>',
            '</a>',
          '</span>',
        '</span>',
        '</div>',
      '</div>',
    '</div>',
  '</div>'
].join('\n');


EntitiesTemplates.Property = [
'<div class="column" id="column-<%- cid %>">',
  '<div class="hi3 hdr"><%- name %></div>',
  '<div class="hi3">',
    '<select class="attribs" id="type-<%- cid %>">',
      '<option value="text" <% if(type =="text") %> selected <% %>>Text</option>',
      '<option value="number" <% if(type =="number") %> selected <% %>>Number</option>',
      '<option value="email" <% if(type =="email") %> selected <% %>>Email</option>',
      '<option value="image" <% if(type =="image") %> selected <% %>>Image</option>',
      '<option value="date" <% if(type =="date") %> selected <% %>>Date</option>',
      '<option value="file" <% if(type =="file") %> selected <% %>>File</option>',
      '<% _.each(entities, function(model){ %>',
        '<% if(model.get("name") != entityName) %>',
        '<option value="{{<%- model.get("name") %>}}" <% if(type == \'{{\'+ model.get("name") +\'}}\') %> selected <% %>>List of <%- model.get("name") %>s</option>',
        '<% %>',
      '<% }); %>',
    '</select>',
  '</div>',
  '<div class="hi2"><input class="attrib-required-check" id="checkbox-field-<%= cid %>" type="checkbox" <% if(required) { print("checked"); }; %>></div>',
  '<div class="hi2 prop-cross" id="delete-<%- cid %>">',
    '<div class="remove">Remove</div>',
  '</div>',
'</div>'
].join('\n');

EntitiesTemplates.UserEntity = [
'<div class="row hoff1">',
  '<div class="span58 entity-pane pane entity" id="user-entity">',
    '<div style="display:inline-block;">',
      '<div class="hoff2 offset2 span30">',
        '<h2><%= role %></h2>',
        '<div class="q-mark-circle"></div>',
      '</div>',
      '<span class="span24 right hoff1">',
        '<span class="span8 hi3 show-data right-icon">',
          '<span class="icon"></span>',
          '<span>See User Data</span>',
        '</span>',
        '<span class="span8 hi3 excel right-icon offset1">',
          '<span class="icon"></span>',
          '<span>Upload Excel</span>',
        '</span>',
      '</span>',
    '</div>',
    '<br>',
    '<hr style="display:block;">',
    '<div class="description">',
      '<h3 class="offset2 hoff1 span58">Description</h3>',
      '<span class="tbl-wrapper span58 hoff1">',
        '<span class="tbl">',
          '<div class="column span6">',
            '<div class="hi3 hdr">Property</div>',
            '<div class="hi3 desc">Type</div>',
            '<div class="hi2 desc">Is Required?</div>',
          '</div>',
          '<div class="column span6">',
            '<div class="hi3 hdr">Username</div>',
            '<div class="hi3">',
              '<select class="attribs" id="Name" disabled>',
                '<option value="text" selected="">Text</option>',
              '</select>',
            '</div>',
            '<div class="hi2"><input class="cb-login" type="checkbox" checked disabled></div>',
          '</div>',
          '<div class="column span6">',
            '<div class="hi3 hdr">Password</div>',
            '<div class="hi3">',
              '<select class="attribs" id="Name" disabled>',
                '<option value="text" selected="">Text</option>',
              '</select>',
            '</div>',
            '<div class="hi2"><input class="cb-login" type="checkbox" checked disabled></div>',
          '</div>',
          '<div class="column span6">',
            '<div class="hi3 hdr">First Name</div>',
            '<div class="hi3">',
              '<select class="attribs" id="Name" disabled>',
                '<option value="text" selected="">Text</option>',
              '</select>',
            '</div>',
            '<div class="hi2"><input class="cb-login" type="checkbox" checked disabled></div>',
          '</div>',
          '<div class="column span6">',
            '<div class="hi3 hdr">Last Name</div>',
            '<div class="hi3">',
              '<select class="attribs" id="Name" disabled>',
                '<option value="text" selected="">Text</option>',
              '</select>',
            '</div>',
            '<div class="hi2"><input class="cb-login" type="checkbox" checked disabled></div>',
          '</div>',
          '<div class="column span6">',
            '<div class="hi3 hdr">Email</div>',
            '<div class="hi3">',
              '<select class="attribs" id="Name" disabled>',
                '<option value="email" selected="">Email</option>',
              '</select>',
            '</div>',
            '<div class="hi2"><input class="cb-login" type="checkbox" checked disabled></div>',
          '</div>',
          '<ul class="property-list"></ul>',
          '<a class="column span8 add-property-column">',
            '<form class="add-property-form" style="display:none">',
              '<div class="hi2 hdr">',
                '<input type="text" class="property-name-input span7" placeholder="Property Name...">',
              '</div>',
            '</form>',
            '<span class="add-property-button"><span class="plus-icon"></span>Add Property</span>',
          '</a>',
        '</span>',
      '</span>',
    '</div><div class="span58 entity-nav">',
      '<ul class="form-list offset1 hoff1">',
      '</ul>',
      '</div>',
    '</div>',
  '</div>'
].join('\n');
