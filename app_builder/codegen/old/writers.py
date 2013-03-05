import sys
import tempfile
from shutil import copytree
from os.path import join
import os.path
import os
import re
from . import *


class DjangoWriter:

  def __init__(self, analyzed_app):
    self.app = analyzed_app

# MODELS

  # our language => django field prefix
  mf_map = {'text' : 'Text',
            'number' : 'Float',
            'date' : 'DateTime',
            'email' : 'Email',}

  def code_for_field(self, f):
    if f['type'] in DjangoWriter.mf_map:
      return  '{} = models.{}Field()\n'.format(f['name'], DjangoWriter.mf_map[f['type']])
    elif f['type'] in [ cls['name'] for cls in self.app.classes ] or f['type'] == 'User':
      return '{} = models.ForeignKey({})\n'.format(f['name'], f['type'])
    else:
      print "Error, field {}:{} not a primitive type nor a model name".format(f['name'], f['type'])
      sys.exit() # XXX raise an exception instead.

  def models_py_as_string(self):
    """Given the entities of the app and their attributes, return the models.py file as a string."""
    generic_imports = "from django.contrib.auth.models import User\n"
    generic_imports += "from django.db import models\n"

    # first put the import statements
    file_string = generic_imports

    # for each entity, declare a class and write the fields.
    for m in self.app.classes:
      # skip users because we just import that.
      if 'hidden' in m: continue
      file_string += 'class {}(models.Model):\n'.format(m['name'])
      for f in m['fields']:
        # go in an indent level
        file_string += '  ' + self.code_for_field(f)

    # if local user that has extra fields, make a userprofile module.
    if self.app.user_settings['local'] and 'fields' in self.app.user_settings and len(self.app.user_settings['fields']) > 0:
      file_string += "class Userprofile(models.Model):"
      file_string += "  user = models.OneToOneField(User, blank=True, editable=False)"
      for f in self.app.user_settings['fields']:
        file_string += '  ' + self.code_for_field(f)

    return file_string

  def model_imports(self):
    imports = []
    imports.append("from django.contrib.auth.models import User")
    for m in self.app.classes:
      if 'hidden' in m: continue
      imports.append('from webapp.models import {}'.format(m['name']))
    if 'fields' in self.app.user_settings and len(self.app.user_settings['fields']) > 0:
      imports.append('from webapp.models import Userprofile')
    return '\n'.join(imports) + '\n'

# FORMS (form details, used as a base for form submission)

  def generate_signup_forms(self):
    signup_forms =  """
class UserField(forms.CharField):
  def clean(self, value):
    super(UserField, self).clean(value)
    try:
      User.objects.get(username=value)
      raise forms.ValidationError("Someone is already using this username. Please pick an other.")
    except User.DoesNotExist:
      return value

class UserForm(forms.Form):
  first_name = forms.CharField(max_length=30)
  last_name = forms.CharField(max_length=30)
  username = UserField(max_length=30)
  password = forms.CharField(widget=forms.PasswordInput())
  password2 = forms.CharField(widget=forms.PasswordInput(), label="Repeat your password")
  email = forms.EmailField()

  def clean_password(self):
    if self.data['password'] != self.data['password2']:
      raise forms.ValidationError('Passwords are not the same')
    return self.data['password']

  def clean(self,*args, **kwargs):
    self.clean_password()
    return super(UserForm, self).clean(*args, **kwargs)
"""
    userprofile_present = 'fields' in self.app.user_settings and len(self.app.user_settings['fields']) > 0
    if userprofile_present:
      signup_forms += """

class UserprofileForm(forms.Form):
  class Meta:
    model=Userprofile
"""
    return signup_forms

  def generate_model_form_code(self, form):
    """ If there is a required field not in "included_fields", we have to get
    it from the user or from the url data. Error if you can't figure it out. """
    form_string = ''
    form_string += 'class {}Form{}(ModelForm):\n'.format(form.entity, form.form_id)
    form_string += '  class Meta:\n'
    form_string += '    model = {}\n'.format(form.entity)
    fields_params = ' '.join([ "'{}',".format(f) for f in form.included_fields])
    form_string += '    fields = ({})\n\n'.format(fields_params)

    # what fields are required but not here?
    # required fields - included fields:
    real_entity = [ m for m in self.app.classes if m['name'] == form.entity ][0]
    missing_fields_names = set([f['name'] for f in get_required_fields_from_model(real_entity)]).difference(set(form.included_fields))
    missing_fields = [f for f in real_entity['fields'] if f['name'] in missing_fields_names]

    user_fields = [f for f in missing_fields if f['type'] == 'User']
    if len(user_fields) > 0:
      form_string += '  def __init__(self, user, *args, **kwargs):\n'
      form_string += '    self.user = user\n'
      form_string += '    super({}Form{}, self).__init__(*args, **kwargs)\n\n'.format(form.entity, form.form_id)

      form_string += '  def save(self, *args, **kwargs):\n'
      form_string += '    self.instance.{} = self.user\n'.format(user_fields[0]['name'])
      form_string += '    return super({}Form{}, self).save(*args, **kwargs)\n'.format(form.entity, form.form_id)
    return form_string

  def model_forms_py_as_string(self):
    """Given knowledge of all the forms, return the models.py file as a string."""
    filestring = ''
    filestring += 'from django.forms import ModelForm\n'
    filestring += 'from django import forms\n'
    filestring += self.model_imports()
    for f in self.app.forms:
      filestring += '\n' + self.generate_model_form_code(f)

    if self.app.user_settings['local']:
      filestring += self.generate_signup_forms()
    return filestring

  def model_form_imports(self):
    imports = []
    imports.append('from webapp.model_forms import UserForm')
    for f in self.app.forms:
      imports.append('from webapp.model_forms import {}Form{}'.format(f.entity, f.form_id))
    if 'fields' in self.app.user_settings and len(self.app.user_settings['fields']) > 0:
      imports.append('from webapp.model_forms import UserprofileForm')

    return '\n'.join(imports)

# FORM RECEIVERS (to capture the POSTS and save the object, or return validation errors)

  def generate_login_form_receiver(self):
    """The view that handles a login form post.
         for now leaving this blank because we will use django's built in view in the urls."""
    pass

  def generate_signup_form_receiver(self):
    """The view that handles a user signup.
         Takes the data, validates user AND userprofile."""
    filestring = ''
    filestring += '@require_POST\n'
    filestring += 'def save_signup(request):\n'
    userprofile_present = 'fields' in self.app.user_settings and len(self.app.user_settings['fields']) > 0
    if userprofile_present:
      filestring += '  userform = UserForm(request.POST)\n'
      filestring += '  profileform = UserprofileForm(request.POST)\n'
      filestring += '  # force evaluation of both to get their errors\n'
      filestring += '  uvalid, pvalid = (userform.is_valid(), profileform.is_valid())\n'
      filestring += '  if uvalid and pvalid:\n'
      filestring += '    user = userform.save()\n'
      filestring += '    profile = profileform.save(commit=False)\n'
      filestring += '    profile.user = user\n'
      filestring += '    profile.save()\n'
      filestring += '    user = authenticate(username=request.POST["username"],\n'
      filestring += '                        password=request.POST["password"])\n'
      filestring += '    login(request, user)\n'
      filestring += '    return redirect("/")\n'
      filestring += '  else:\n'
      filestring += '    usererrs = { "errors" : [(k, v[0]) for k, v in userform.errors.items()] }\n'
      filestring += '    proferrs = { "errors" : [(k, v[0]) for k, v in profileform.errors.items()] }\n'
      filestring += '    return HttpResponse(simplejson.dumps(dict(usererrs.items() + proferrs.items())), status=400)\n'
    else:
      filestring += '  userform = UserForm(request.POST)\n'
      filestring += '  if userform.is_valid():\n'
      filestring += "    user = User.objects.create(request.POST['username'], request.POST['email'], request.POST['password'])"
      filestring += '    user = authenticate(username=request.POST["username"],\n'
      filestring += '                        password=request.POST["password"])\n'
      filestring += '    login(request, user)\n'
      filestring += '    return redirect("/")\n'
      filestring += '  else:\n'
      filestring += '    usererrs = { "errors" : [(k, v[0]) for k, v in userform.errors.items()] }\n'
      filestring += '    return HttpResponse(simplejson.dumps(usererrs), status=400)\n'
    return filestring

  @staticmethod
  def generate_form_receiver(form):
    filestring = ''
    filestring += '@require_POST\n'
    if form.parent_page.access_level == 'user':
      filestring += '@login_required\n'
    filestring += 'def save_{}Form{}(request):\n'.format(form.entity, form.form_id)
    filestring += '  new_form = {}Form{}(request.user, request.POST)\n'.format(form.entity, form.form_id)
    filestring += '  if new_form.is_valid():\n'
    filestring += '    obj = new_form.save()\n'
    filestring += '    return HttpResponse("OK")\n'
    filestring += '  else:\n'
    filestring += '    return HttpResponse(simplejson.dumps({ "errors" : [(k, v[0].__unicode__()) for k, v in new_form.errors.items()] }), status=400)\n'
    return filestring

  def form_receivers_py_as_string(self):
    filestring = "from django.http import HttpResponse\n"
    filestring+= "from django.contrib.auth.decorators import login_required\n"
    filestring+= "from django.views.decorators.http import require_GET, require_POST\n"
    filestring+= "from django.utils import simplejson\n"
    filestring+= "from django.shortcuts import redirect, render, get_object_or_404\n\n"
    filestring+= self.model_form_imports() + '\n\n' 

    for f in self.app.forms:
      filestring += '\n'+ DjangoWriter.generate_form_receiver(f)

    if self.app.user_settings['local']:
      filestring += '\n' + self.generate_signup_form_receiver()
    return filestring

# CONTROLLERS (functions are namespaced by "view_" to avoid name collisions with models or anything else)

  @staticmethod
  def generate_controller_for_page(page):
    """For a single page, generate the controller function which will be executed.
         Should include the declaration, queries, and render the write template."""
    # function declaration
    url_data_params = [ u.lower() + '_id' for u in page.url_data ] # User => user_id
    function = "@require_GET\n"
    if page.access_level == 'user':
      function += "@login_required\n"
    function += "def view_{}(request{}):\n".format(page.name, ''.join([ ', ' + u for u in url_data_params ]))

    # setup the context, start with the url data, if it was passed
    function += "  page_context = {}\n"
    for i, (model_name, param_name) in enumerate(zip(page.url_data, url_data_params)):
      function += "  page_context['url_q{}'] = get_object_or_404({}, pk={})\n".format(i, model_name, param_name)

    # now do the queries
    for i, q in enumerate(page.queries):
      function += "  page_context['q{}'] = {}\n".format(i, q)

    # and render the right template
    function += "  return render(request, 'webapp/{}.html', page_context)\n".format(page.name)

    return function

  def views_py_as_string(self):
    """Generate views.py, including imports and a view function for each page."""
    filestring = "from django.http import HttpResponse, HttpRequest\n"
    filestring+= "from django.contrib.auth.decorators import login_required\n"
    filestring+= "from django.views.decorators.http import require_GET, require_POST\n"
    filestring+= "from django.utils import simplejson\n"
    filestring+= "from django.shortcuts import redirect, render, get_object_or_404\n"
    filestring += self.model_imports()
    filestring += '\n\n'.join([ DjangoWriter.generate_controller_for_page(p) for p in self.app.pages ])
    return filestring

  def view_imports(self):
    """Imports required for the views."""
    s = ''
    for p in self.app.pages:
      s += 'from webapp.views import view_{}\n'.format(p.name)
    if 'fields' in self.app.user_settings and len(self.app.user_settings['fields']) > 0:
      imports.append('from webapp.models import Userprofile')

    return s

# ROUTES/URLS

  def generate_login_urls(self):
    urls = ""
    if self.app.user_settings['local']:
      urls += '  url(r"^login_receiver/", "django.contrib.auth.views.login"),\n'
      urls += '  url(r"^signup_receiver/", "webapp.form_receivers.save_signup"),\n'
    # TODO add facebook, twitter, linkedin oauth things here.
    return urls

  @staticmethod
  def generate_url_entry(page):
    entry = "url(r'{}', 'webapp.views.view_{}'),".format(url_parts_to_regex(page.url_parts), page.name)
    return entry

  @staticmethod
  def generate_form_url_entry(form):
    entry = "url(r'^formsubmit/{}/{}/$', 'webapp.form_receivers.save_{}Form{}'),".format(form.entity, form.form_id, form.entity, form.form_id)
    return entry

  def urls_py_as_string(self):
    urls_string = 'from django.conf.urls import patterns, include, url\n'
    urls_string += 'from django.contrib.staticfiles.urls import staticfiles_urlpatterns\n\n'

    urls_string += 'from django.contrib import admin\n'
    urls_string += 'admin.autodiscover()\n\n'

    urls_string += "urlpatterns = patterns('',\n"
                  #"  url(r'^accounts/', include('allauth.urls')),\n"
    urls_string += self.generate_login_urls()
    urls_string += "  url(r'^admin/', include(admin.site.urls)),\n\n"
    for p in self.app.pages:
      urls_string += '  {}\n'.format(DjangoWriter.generate_url_entry(p))
    urls_string += '\n'
    for f in self.app.forms:
      urls_string += '  {}\n'.format(DjangoWriter.generate_form_url_entry(f))

    urls_string += ')\n\n'

    urls_string += "urlpatterns += staticfiles_urlpatterns()"
    return urls_string

# TEMPLATES
  @staticmethod
  def get_random_classname():
    """Get a random 8-letter string"""
    import string
    import random
    chrs = []
    for i in range(0,8):
      chrs.append(random.choice(string.ascii_letters))
    return ''.join(chrs)

  @staticmethod
  def render_uielement(el):

    def get_classes(el, lib_el):
      """list of classes for this el"""
      def widthclass(width):
        return "span{}".format(width)
      def heightclass(height):
        return "hi{}".format(height)
      classes = [lib_el.class_name, widthclass(el['layout']['width']), heightclass(el['layout']['height'])]

      return classes

    def get_attributes(el):
      """list of attr/value pairs for this el"""
      return el['attribs'].items()

    from v1factory.models import UIElement
    try:
      lib_el = UIElement.get_library().get(id=el['lib_id'])
    except Exception, e:
      print e
      return "<p>Element could not be found. See logs.</p>"
    else:
      classes = get_classes(el, lib_el)
      attributes = get_attributes(el)
      class_string = " ".join(classes)
      attr_string = " ".join([ '{}="{}"'.format(a[0], a[1]) for a in attributes ])

      if el['container_info'] is not None:
        container_els = [ DjangoWriter.render_uielement(inner_el) for inner_el in el['container_info']['uielements'] ]
        html = "\n".join(container_els)
        return html

      elif lib_el.tagname in ['img', 'input']:
         html = "<{} class=\"{}\" {} />".format(lib_el.tagname, class_string, attr_string)
         return html

      else:
        filler = lib_el.html
            # LATER maybe use this context system if we need more than just text:
            # replace the handlebars with context - <p><%= text %></p>  =>  <p>Hello</p>
            #for k, v in el['context'].items():
            #  handlebars_html = re.sub('<%= {} %>'.format(k), v, handlebars_html)

        handlebars_html = "<{} class=\"{}\" {}>{}</{}>".format(lib_el.tagname, class_string, attr_string, filler, lib_el.tagname)

        if 'text' in el:
          html = re.sub('<%= text %>', el['text'], handlebars_html)
        else:
          html = handlebars_html

        return html

  @staticmethod
  def generate_template_code(page):

    print page.name
    """Given a page, return the template code.
       For each UIElement, render the proper django template, which
       will be set up to receive the context from the view"""
    html = ''
    html += '{% extends "base.html" %}\n\n'
    html += '{% block title %}'+page.name+'{% endblock %}\n\n'
    html += '{% block content %}\n'
    query_counter = 0
    for el in page.uielements:
      raw_template = DjangoWriter.render_uielement(el)

      # replace the input_Data variable names with the right thing
      template_text = re.sub(r'{{ *[A-Z][a-z0-9_]*[\._]([a-zA-Z0-9_]+) *}}', r'{{ this_thing.\1 }}', raw_template)

      # if this is a container, do things like forms and for loops for the queries.
      if el['container_info'] is not None:
        if el['container_info']['action'] == 'show':
          html += """{% for this_thing in q"""+ str(query_counter) +""" %}"""
          html += template_text
          html += """{% endfor %}"""
        elif el['container_info']['action'] == 'create':
          form_obj = el['container_info']['form']
          html += """<form method="POST" action="{% url """+ "webapp.form_receivers.save_{}Form{}".format(form_obj.entity, form_obj.form_id) +""" %}">"""
          html += """{% csrf_token %}"""
          html += template_text
          html += """</form>"""
        elif el['container_info']['action'] == 'login':
          html += """<form method="POST" action="{% url django.contrib.auth.views.login %}">"""
          html += """{% csrf_token %}"""
          html += template_text
          html += """</form>"""
        elif el['container_info']['action'] == 'signup':
          html += """<form method="POST" action="{% url webapp.form_receivers.save_signup %}">"""
          html += """{% csrf_token %}"""
          html += template_text
          html += """</form>"""
        else:
          raise Exception("Not yet implemented.")
      # so this is not a container, it must be a normal uielement.
      else:
        html += template_text

    html += '\n{% endblock %}'

    return html

  def templates_as_strings(self):
    """Return a list of tuples: (filename, template content)"""
    kilter = [] # yes this is intentionally a bad variable name.
    for p in self.app.pages:
      twoplee = ('{}.html'.format(p.name), DjangoWriter.generate_template_code(p))
      kilter.append(twoplee)
    return kilter

  def get_all_lib_ids(self):
    bag_of_lib_ids = set()
    for p in self.app.pages:
      print p
      print type(p)
      for t in p.uielements:
        bag_of_lib_ids.add(t['lib_id'])

    return bag_of_lib_ids

  def generate_css_as_string(self):
    from v1factory.models import UIElement
    css_el_strings = []
    for lib_id in self.get_all_lib_ids():
      el = UIElement.objects.get(pk=lib_id)
      css_string = "." + el.class_name + " { " + el.css + " }"
      css_el_strings.append(css_string)
    return '\n\n'.join(css_el_strings)


# WRITE THE WHOLE THING

  def write(self, dest=None):
    STARTER_CODE_PATH = os.path.abspath(join(os.path.dirname(__file__), 'starter'))

    if dest is None:
      # create a temporary working directory
      dest = join(tempfile.mkdtemp(), "djanggggg")

    # clone the starter code
    copytree(STARTER_CODE_PATH, dest)

    # create inner app directory to hold models and views
    inner_app_dir = join(dest, "webapp")
    if not os.path.exists(inner_app_dir):
      os.makedirs(inner_app_dir)

    statics_dir = join(dest, "static")
    if not os.path.exists(statics_dir):
      os.makedirs(statics_dir)

    css_dir = join(statics_dir, "stylesheets")
    if not os.path.exists(css_dir):
      os.makedirs(css_dir)

    css_file = open(join(css_dir, "style.css"), "w")
    css_file.write(self.generate_css_as_string())
    css_file.close()

    init_py = open(join(inner_app_dir, "__init__.py"), "w")
    init_py.write("# ;)")
    init_py.close()

    # write urls
    urls_file = open(join(dest, "urls.py"), "w")
    urls_file.write(self.urls_py_as_string())
    urls_file.close()

    # write models file
    models_file = open(join(inner_app_dir, "models.py"), "w")
    models_file.write(self.models_py_as_string())
    models_file.close()

    # write model forms file
    views_file = open(join(inner_app_dir, "model_forms.py"), "w")
    views_file.write(self.model_forms_py_as_string())
    views_file.close()

    # write form receivers file
    views_file = open(join(inner_app_dir, "form_receivers.py"), "w")
    views_file.write(self.form_receivers_py_as_string())
    views_file.close()

    # write views file
    views_file = open(join(inner_app_dir, "views.py"), "w")
    views_file.write(self.views_py_as_string())
    views_file.close()

    # make templates directory and write templates files
    templates_dir = join(dest, os.path.normpath("templates"))
    if not os.path.exists(templates_dir):
      os.makedirs(templates_dir)

    webapp_templates_dir = join(templates_dir, os.path.normpath("webapp"))
    if not os.path.exists(webapp_templates_dir):
      os.makedirs(webapp_templates_dir)

    for fname, content in self.templates_as_strings():
      template_file = open(join(templates_dir, "webapp", fname), "w")
      template_file.write(content)
      template_file.close()

    return dest