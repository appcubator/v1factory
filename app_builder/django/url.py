from form_receiver import DjangoFormReceiver

class DjangoUrl(object):

  def __init__(self, page=None, view=None, analyzed_app=None):
    self.name = view.name
    self.page = page
    self.app = analyzed_app
    self.view = view

  @classmethod
  def create_get(cls, page, view, analyzed_app):
    return cls(page=page,view=view,analyzed_app=analyzed_app)

  @classmethod
  def create_post(cls, form_receiver, analyzed_app):
    return cls(page=form_receiver.page, view=form_receiver, analyzed_app=analyzed_app)

  def url_parts_to_regex(self):
    url_parts = self.page.route.urlparts
    id_regex = r'(\d+)'
    def repl_model_with_id_regex(s):
      if isinstance(s, str) or isinstance(s, unicode):
        return s
      else:
        from app_builder.analyzer import Model
        assert(isinstance(s, Model))
        return id_regex

    return '^' + ''.join(map(lambda x : repl_model_with_id_regex(x) + r'/', url_parts)) + '$'

  def url_repr(self):
    from app_builder.analyzer import Form
    if isinstance(self.view, DjangoFormReceiver):
      return repr("^{}/$".format(self.view.identifier()))
    return repr(self.url_parts_to_regex())

  def view_path_repr(self):
    return repr(self.view.view_path())
