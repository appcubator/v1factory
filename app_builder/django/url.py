from form_receiver import DjangoFormReceiver

class DjangoUrl(object):

  def __init__(self, page=None, view=None, analyzed_app=None, models=None):
    self.name = view.name
    self.page = page
    self.urlparts = []
    from app_builder.analyzer import Model
    for m in self.page.route.urlparts:
      if isinstance(m, Model):
        self.urlparts.append(models.get_by_name(m.name))
      else:
        self.urlparts.append(m)
    self.app = analyzed_app
    self.view = view
    self.view.url = self

  @classmethod
  def create_get(cls, page, view, analyzed_app, models):
    url_obj = cls(page=page,view=view,analyzed_app=analyzed_app, models=models)
    return url_obj

  @classmethod
  def create_post(cls, form_receiver, analyzed_app, models):
    return cls(page=form_receiver.page, view=form_receiver, analyzed_app=analyzed_app, models=models)

  def url_parts_to_regex(self):
    url_parts = self.urlparts
    id_regex = r'(\d+)'
    def repl_model_with_id_regex(s):
      if isinstance(s, str) or isinstance(s, unicode):
        return s.strip()
      else:
        from model import DjangoModel
        assert(isinstance(s, DjangoModel))
        return id_regex

    return '^' + ''.join(map(lambda x : repl_model_with_id_regex(x) + r'/', url_parts)) + '$'

  def url_repr(self):
    from app_builder.analyzer import Form
    if isinstance(self.view, DjangoFormReceiver):
      return repr("^{}/$".format(self.view.identifier()))
    return repr(self.url_parts_to_regex())

  def view_path_repr(self):
    return repr(self.view.view_path())

  def model_refs(self):
    from model import DjangoModel
    print self.urlparts
    return [ u for u in self.urlparts if isinstance(u, DjangoModel) ]
