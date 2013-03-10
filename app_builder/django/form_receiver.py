class DjangoFormReceiver(object):
  """For now it only handles create forms"""
  def __init__(self, name=None, included_fields=None, model=None):
    self.name = name
    self.included_fields = included_fields
    self.model = model

  @classmethod
  def create(cls, form, analyzed_app):
    name = form.name
    model = analyzed_app.models.get_by_name(form.entity.name)
    included_fields = form.included_fields
    self = cls(name=name, included_fields=included_fields, model=model)

    self.form = form
    self.form.form_receiver = self
    self.page = form.page

    return self

  def find_model(self, models):
    self.model = models.get_by_name(self.model.name)
    for i, f in enumerate(self.included_fields):
      self.included_fields[i] = self.model.fields.get_by_name(f.name)

  def identifier(self):
    return "receive_{}".format(self.form.name)

  def view_path(self):
    return "webapp.form_receivers."+self.identifier()

