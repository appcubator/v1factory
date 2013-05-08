from app_builder.analyzer import CreateForm
import re

class DjangoFormReceiver(object):
  """For now it only handles create forms"""
  def __init__(self, name=None, included_fields=None, model=None, goto_view=None):
    self.name = name

    self.included_fields = included_fields
    self.foreign_key_fields = []

    self.model = model
    self.form_fields = []

    self.goto_view = goto_view

  def init_fields(self):
    for f in self.included_fields:
      if f.field_type != 'button':
        self.form_fields.append(DjangoFormField.create(f, self))
    pass

  @classmethod
  def create(cls, form, analyzed_app):
    name = form.name
    model = analyzed_app.models.get_by_name(form.model.name)
    included_fields = form.included_fields
    self = cls(name=name, included_fields=included_fields, model=model, goto_view=form.redirect_page._django_view)

    assert isinstance(form, CreateForm), "Only use this function for create forms"
    self.belongs_to = form.belongs_to
    self.form = form
    self.form.form_receiver = self
    self.page = form.page

    return self

  @classmethod
  def create_signup(cls, form, analyzed_app):
    name = form.name
    self = cls(name=name, included_fields=form.included_fields, model=analyzed_app.models.get_by_name('User'), goto_view=form.redirect_page._django_view)

    self.form = form
    self.form.form_receiver = self
    self.page = form.page

    return self

  @classmethod
  def create_login(cls, form, analyzed_app):
    name = form.name
    self = cls(name=name, included_fields=form.included_fields, model=analyzed_app.models.get_by_name('User'), goto_view=form.redirect_page._django_view)

    self.form = form
    self.form.form_receiver = self
    self.page = form.page

    return self

  def find_model(self, models):
    """Gets the Django Model"""
    """maps to model fields"""
    self.model = models.get_by_name(self.model.name)
    for f in filter(lambda x: x.field_type != 'button', self.included_fields):

      if f.is_model_field() and f.name != 'username':
        f._django_field = self.model.fields.get_by_name(f.model_field.name)
        f.post_name = f._django_field.identifier()
      else:
        assert f.name in ['username', 'password', 'password1', 'password2'] # these are the only non model fields we support
        f._django_field = None
        f.post_name = f.name

  def init_foreign_keys(self, django_models_manager):
    assert isinstance(self.form, CreateForm), "Only use this function for create forms"

    if self.belongs_to is not None:
      print "belongs to" , self.belongs_to
      match = re.match(r'\{\{ ?([A-Za-z0-9]+)\.([ \w]+\w) ?\}\}', self.belongs_to)
      m_name, f_name = match.group(1), match.group(2)

      related_field = self.model.fields.get_by_attr('related_name', f_name)
      assert related_field.related_model.name == m_name, "some weird foreign key naming going on..."

      related_field._django_field = related_field # hack so that one of the templates works

      # before we commit to this, we should make sure the field's model is actually in the url data
      assert related_field.related_model in self.url.model_refs()

      self.foreign_key_fields.append(related_field)
      self.form.foreign_key_fields = self.foreign_key_fields

  def identifier(self):
    def sanitize_name(s):
      return s.replace(" ", "_")
    return "receive_{}".format(sanitize_name(self.form.name)).lower()

  def view_path(self):
    return "webapp.form_receivers."+self.identifier()

  def render(self, env):
    if self.model.name != 'User':
      template = env.get_template('form_receiver.py')
      return template.render(form_receiver=self)
    else:
      template = env.get_template('signup_form_receiver.py')
      return template.render(form_receiver=self)

class SignupFormReceiver(DjangoFormReceiver):

  def __init__(self, *args, **kwargs):
    super(SignupFormReceiver, self).__init__(*args, **kwargs)
    self.name = "receive_signup"

  @property
  def userprofile_fields(self):
    up_fields = [ f._django_field for f in self.included_fields if f._django_field is not None and f._django_field.name != 'username' ]
    return up_fields

  def render(self, env):
    template = env.get_template('signup_form_receiver.py')
    return template.render(form_receiver=self)

class LoginFormReceiver(DjangoFormReceiver):

  def __init__(self, *args, **kwargs):
    super(LoginFormReceiver, self).__init__(*args, **kwargs)
    self.name = "receive_login"

  def render(self, env):
    template = env.get_template('login_form_receiver.py')
    return template.render(form_receiver=self)
