def generate_models_py(classes):
  pass # TODO cpy paste

def generate_urls_py(templates):
  urls_string = ''
  urls_string += '### AUTOGENERATED by v1Factory\n\n'
  urls_string += 'from django.conf.urls import patterns, include, url\n'
  # begin urls section
  urls_string += "urlpatterns = patterns('django.views.generic.simple',\n"
  for tmp in templates:
  	urls_string += "  url(r'^%s$', 'direct_to_template', { 'template': '%s.html'}),\n" % (tmp.name, tmp.name)
  # end urls section
  urls_string += ")"
  return urls_string

def generate_templates(templates):
  template_strings = []
  for tmp in templates:
    template_strings.append(tmp.render_to_html())
  return template_strings

def create_django_project(classes, templates):
  # clone the starter code
  # write urls, models, templates
  pass