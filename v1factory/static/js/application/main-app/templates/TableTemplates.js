var TableTemplates = {};

TableTemplates.Table = [
'<div class="row">',
  '<p class="lead" style="display:none">Click "Add Table" to create your first table</p>',
  '<div class="span58 entity" id="entity-entity">',
    '<div class="header">',
      '<div class="offset2 hi4 span26">',
        '<h2><%= name %></h2>',
        '<div class="q-mark-circle"></div>',
        '<div class="related-fields"></div>',
      '</div>',
      '<span class="right">',
        '<span class="hi4 show-data right-icon">',
          '<span class="icon"></span>',
          '<span>Description</span>',
        '</span><span class="hi4 show-data right-icon">',
          '<span class="icon"></span>',
          '<span>See User Data</span>',
        '</span><span class="hi4 excel right-icon">',
          '<span class="icon"></span>',
          '<span>Upload Excel</span>',
        '</span>',
      '</span>',
    '</div><div class="description">',
      '<span class="tbl-wrapper span58">',
        '<span class="tbl">',
          '<div class="column span6">',
            '<div class="hi3 hdr">Property</div>',
            '<div class="hi3 desc">Type</div>',
          '</div>',
          '<ul class="property-list">',
          '</ul>',
          '<div class="column span8 add-property-column">',
            '<form class="add-property-form" style="display:none">',
              '<div class="hi2 hdr">',
                '<input type="text" class="property-name-input span7" placeholder="Property Name...">',
              '</div>',
            '</form>',
            '<span class="add-property-button"><span class="plus-icon"></span>Add Property</span>',
          '</div>',
        '</span>',
      '</span>',
    '</div>',
  '</div>',
'</div>'
].join('\n');


TableTemplates.Property = [
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
      '<% _.each(entities, function(entity){ %>',
        '<option value="single-<%- entity %>" <% if((type == "fk"||type == "o2o") && entity_name == entity) %> selected <% %>><%- entity %></option>',
      '<% }); %>',
      '<% _.each(entities, function(entity){ %>',
        '<option value="m2m-<%- entity %>" <% if(type == "m2m" && entity_name == entity) %> selected <% %>>List of <%- entity %>s</option>',
      '<% }); %>',
    '</select>',
  '</div>',
  '<div class="hi2 prop-cross" id="delete-<%- cid %>">',
    '<div class="remove">Remove</div>',
  '</div>',
'</div>'
].join('\n');

TableTemplates.UserTable = [
'<div class="row">',
  '<div class="span58 entity" id="user-entity">',
    '<div class="header">',
      '<div class="offset2 hi4 span26">',
        '<h2><%= name %></h2>',
        '<div class="q-mark-circle"></div>',
        '<div class="related-fields"></div>',
      '</div>',
      '<span class="right">',
        '<span class="hi4 show-data right-icon">',
          '<span class="icon"></span>',
          '<span>Description</span>',
        '</span><span class="hi4 show-data right-icon">',
          '<span class="icon"></span>',
          '<span>See User Data</span>',
        '</span><span class="hi4 excel right-icon">',
          '<span class="icon"></span>',
          '<span>Upload Excel</span>',
        '</span>',
      '</span>',
    '</div><div class="description">',
      '<span class="tbl-wrapper span58">',
        '<span class="tbl">',
          '<ul class="property-list">',
            '<div class="column span6">',
              '<div class="hi3 hdr">Property</div>',
              '<div class="hi3 desc">Type</div>',
            '</div>',
            '<div class="column span6">',
              '<div class="hi3 hdr">Username</div>',
              '<div class="hi3">',
                '<select class="attribs" id="Name" disabled>',
                  '<option value="text" selected="">Text</option>',
                '</select>',
              '</div>',
            '</div>',
            '<div class="column span6">',
              '<div class="hi3 hdr">Password</div>',
              '<div class="hi3">',
                '<select class="attribs" id="Name" disabled>',
                  '<option value="text" selected="">Text</option>',
                '</select>',
              '</div>',
            '</div>',
            '<div class="column span6">',
              '<div class="hi3 hdr">First Name</div>',
              '<div class="hi3">',
                '<select class="attribs" id="Name" disabled>',
                  '<option value="text" selected="">Text</option>',
                '</select>',
              '</div>',
            '</div>',
            '<div class="column span6">',
              '<div class="hi3 hdr">Last Name</div>',
              '<div class="hi3">',
                '<select class="attribs" id="Name" disabled>',
                  '<option value="text" selected="">Text</option>',
                '</select>',
              '</div>',
            '</div>',
            '<div class="column span6">',
              '<div class="hi3 hdr">Email</div>',
              '<div class="hi3">',
                '<select class="attribs" id="Name" disabled>',
                  '<option value="email" selected="">Email</option>',
                '</select>',
              '</div>',
            '</div>',
          '</ul>',
          '<div class="column span8 add-property-column">',
            '<form class="add-property-form" style="display:none">',
              '<div class="hi2 hdr">',
                '<input type="text" class="property-name-input span7" placeholder="Property Name...">',
              '</div>',
            '</form>',
            '<span class="add-property-button"><span class="plus-icon"></span>Add Property</span>',
          '</div>',
        '</span>',
      '</span>',
    '</div>',
    '</div>',
  '</div>'
].join('\n');

TableTemplates.Navbar = [
'<div class="span58 entity-nav">',
  '<ul class="form-list offset1 hoff1">',
  '</ul>',
'</div>'
].join('\n');
