import os
import os.path
import shutil
import tempfile

from os.path import join
from jinja2 import Environment, PackageLoader


class DjangoAppWriter:
  """Write django apps. Nuff said"""
  env = Environment(loader=PackageLoader('app_builder.django', 'code_templates'))
  template_env = Environment(loader=PackageLoader('app_builder.django', 'code_templates/template_templates'))

  bpsrc = os.path.join(os.path.dirname(__file__), os.path.normpath("code_boilerplate"))

  def __init__(self, django_app):
    self.django_app = django_app

  """ Main app content """

  def render_models_py(self):
    template = DjangoAppWriter.env.get_template('models.py')
    return template.render(models=list(self.django_app.models.each()))

  def render_urls_py(self):
    template = DjangoAppWriter.env.get_template('urls.py')
    return template.render(urls=list(self.django_app.urls.each()), form_receivers=[])

  def render_views_py(self):
    template = DjangoAppWriter.env.get_template('views.py')
    return template.render(views=self.django_app.views.each(), models=self.django_app.models.each())

  def render_form_receivers_py(self):
    template = DjangoAppWriter.env.get_template('form_receivers.py')
    return template.render(form_receivers=self.django_app.form_receivers.each(), models=self.django_app.models.each())

  def render_templates(self):
    for t in self.django_app.templates.each():
      yield (t.filename, t.render(self.template_env),)

  def render_css(self):
    return ""

  """ Directory Structure """

  """
  ./
    requirements.txt

    __init__.py
    manage.py
    settings.py
    wsgi.py
    urls.py

    webapp/
      __init__.py
      models.py
      views.py

    templates/
      base.html
      webapp/
        <template files>

    static/
      reset.css
      bootstrap.css
      style.css
      ajaxify.js
      jslibs/
        backbone.js
        underscore.js
        bootstrap.min.js
  """

  def write_to_fs(self, dest=None):
    if dest is None:
      dest = tempfile.mkdtemp()

    bpsrc = DjangoAppWriter.bpsrc

    # if dir is not empty, throw an exception
    dest = os.path.normpath(dest)
    if os.listdir(dest):
      raise Exception("I'm not going to write into a nonempty directory, that's dangerous")

    # create directories
    if not os.path.exists(dest):
      os.makedirs(dest)
    webapp_dir = join(dest, "webapp")
    templates_dir = join(dest, "templates")
    templates_webapp_dir = join(templates_dir, "webapp")
    static_dir = join(dest, "static")
    static_jslibs_dir = join(static_dir, "jslibs")
    os.mkdir(webapp_dir)
    os.mkdir(templates_dir)
    os.mkdir(templates_webapp_dir)
    os.mkdir(static_dir)

    def f_transporter(src_str, dest_str, f, *args, **kwargs):
      src_tokens = src_str.split('/')
      dest_tokens = dest_str.split('/')
      return f(join(bpsrc, *src_tokens), join(dest, *dest_tokens), *args, **kwargs)

    def write_string(content, dest_str):
      dest_tokens = dest_str.split('/')
      f = open(join(dest, *dest_tokens), "w")
      f.write(content)
      f.close()

    def copy_file(src_str, dest_str):
      return f_transporter(src_str, dest_str, shutil.copyfile)

    # copy boilerplate
    copy_file('.gitignore', '.gitignore')
    copy_file('requirements.txt', 'requirements.txt')
    copy_file('__init__.py', '__init__.py')
    copy_file('manage.py', 'manage.py')
    copy_file('settings.py', 'settings.py')
    copy_file('wsgi.py', 'wsgi.py')

    # main webapp files
    copy_file('__init__.py', 'webapp/__init__.py')
    write_string(self.render_models_py(), 'webapp/models.py')
    write_string(self.render_views_py(), 'webapp/views.py')
    write_string(self.render_form_receivers_py(), 'webapp/form_receivers.py')
    write_string(self.render_urls_py(), 'urls.py')

    # templates
    copy_file('base.html', 'templates/base.html')
    for fname, template in self.render_templates():
      write_string(template, 'templates/webapp/{}'.format(fname))

    # static
    f_transporter('jslibs', 'static/jslibs', shutil.copytree)
    f_transporter('img', 'static/img', shutil.copytree)
    copy_file('ajaxify.js', 'static/ajaxify.js')
    copy_file('css/bootstrap.css', 'static/bootstrap.css')
    write_string(self.render_css(), 'static/style.css')
    # TODO copy the other css files here too later.

    return dest
