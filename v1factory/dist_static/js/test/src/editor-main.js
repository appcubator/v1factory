require.config({paths:{jquery:"../../libs/jquery/jquery","jquery-ui":"../../libs/jquery-ui/jquery-ui",underscore:"../../libs/underscore-amd/underscore",backbone:"../../libs/backbone-amd/backbone",backboneui:"../../backbone/BackboneUI",key:"../../libs/keymaster/keymaster",iui:"../../libs/iui/iui",app:"../../app",editor:"../../app/editor",dicts:"../../dicts"},shim:{"jquery-ui":{exports:"$",deps:["jquery"]},underscore:{exports:"_"},backbone:{exports:"Backbone",deps:["underscore","jquery"]}}});var pageId=3,g_editorView,g_appState={},g_initial_appState={},GRID_WIDTH=80,GRID_HEIGHT=15;require(["editor/EditorView","../lib/jasmine-1.3.1/jasmine","../lib/jasmine-1.3.1/jasmine-html","../../libs/keymaster/keymaster","./appState","./defaultElements","dicts/design-options","./uieState"],function(e){function s(){n.execute()}var t=new e;g_editorView=t,g_appState=appState,g_initial_appState=_.clone(appState),describe("appState model input-outputs",function(){it("doesnt fuck up",function(){alert("hey"),t.save(),expect(appState).toEqual(g_initial_appState)})}),console.log(jasmine);var n=jasmine.getEnv();n.updateInterval=1e3;var r=new jasmine.HtmlReporter;n.addReporter(r),n.specFilter=function(e){return r.specFilter(e)};var i=window.onload;window.onload=function(){i&&i(),s()}});