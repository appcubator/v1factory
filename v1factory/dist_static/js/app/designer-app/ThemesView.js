define(["backbone","iui"],function(e){var t=e.View.extend({el:document.body,events:{"click .create-theme":"createTheme","submit .create-form":"createFormSubmitted"},initialize:function(e){_.bindAll(this,"render","createTheme","createFormSubmitted"),this.render()},render:function(){},createTheme:function(){$(".create-theme").hide(),$(".create-container").fadeIn()},createFormSubmitted:function(e){var t=$(".theme-name").val();$.ajax({type:"POST",url:"/theme/new/",data:{name:t},success:function(e){console.log(e)},dataType:"JSON"}),e.preventDefault(),$(e.target).hide(),$(".create-theme").fadeIn()}});return t});