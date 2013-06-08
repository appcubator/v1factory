from dict_inited import DictInited
from app_builder.resolving import Resolvable, LinkLang
from app_builder.analyzer_utils import encode_braces, decode_braces
from jinja2 import Environment, PackageLoader
from app_builder.htmlgen import Tag
from copy import deepcopy


env = Environment(trim_blocks=True, lstrip_blocks=True, loader=PackageLoader(
    'app_builder.code_templates', 'htmlgen'))

def get_uielement_by_type(type_string):
    UIELEMENT_TYPE_MAP = {'form': Form,
                          'loop': Iterator,
                          'node': Node,
                         }
    subclass = UIELEMENT_TYPE_MAP[type_string]
    return subclass


class Layout(DictInited):
    _schema = {
        "width": {"_type": 0, "_min": 1, "_max": 64},
        "height": {"_type": 0, "_min": 1},
        "top": {"_type": 0, "_min": 0},
        "left": {"_type": 0, "_min": 0, "_max": 64},
        "t_padding": {"_type": 0, "_default": 0},
        "b_padding": {"_type": 0, "_default": 0},
        "l_padding": {"_type": 0, "_default": 0},
        "r_padding": {"_type": 0, "_default": 0},
        "alignment": {"_type": "", "_default": "left"},
        "font-size": {"_type": "", "_default": ""},
    }

    def has_padding(self):
        return self.t_padding > 0 or self.b_padding > 0 or self.l_padding > 0 or self.r_padding > 0


class UIElement(DictInited):
    _schema = {"layout": {"_type": Layout},
               "type": {"_type": ""}, # Specifies the type of the UIElement this represents.
               "data": {"_type": {}}} # An arbitrary dict, used to init a specific type of UIElement.

    def __init__(self, *args, **kwargs):
        """Uses type and data attributes to dynamically create the subclass"""
        super(UIElement, self).__init__(*args, **kwargs)
        try:
            subclass = get_uielement_by_type(self.type)
        except KeyError:
            raise Exception("Type not recognized: %r" % self.type)
        self.subclass = subclass.create_from_dict(self.data)
        self.subclass.layout = self.layout


class Hooked(object):

    @property
    def hooks(self):
        try:
            return self.__class__._hooks
        except AttributeError:
            return () # empty tuple


class Form(DictInited, Hooked):

    # these are tightly coupled and serial for now.
    _hooks = ('create form object',
              'import form into form receivers',
              'create form receiver',
              'create url for form receiver',
              # add the url to the action attribute, this happens in the "create url" phase
             )

    @property
    def hooks(self):
        action = self.container_info.form.action
        if action not in ('login', 'signup'):
            return super(Form, self).hooks

        if action == 'login':
            return ('create login form if not exists',
                    'import form into form receivers',
                    'create login form receiver if not exists',
                    'create url for form receiver',
                   )

        elif action == 'signup':
            return ('create signup form if not exists',
                    'import form into form receivers',
                    'create signup form receiver if not exists',
                    'create url for form receiver',
                   )

        else:
            assert False, "Form action not recognized: %s" % action



    class FormInfo(DictInited):

        class FormInfoInfo(DictInited, Resolvable):

            class FormField(object):

                def htmls(field):
                    base_attribs = {}
                    tagname = 'input'
                    content=None

                    # logic to set up the html data
                    if field.displayType.endswith('-text'):
                        base_attribs = {'type': 'text',
                                        'placeholder': field.placeholder,
                                        'name': field.backend_field_name
                                       }
                        if field.displayType == 'password-text':
                            base_attribs['type'] = 'password'

                        if field.displayType == 'paragraph-text':
                            del base_attribs['type']
                            tagname = 'textarea'

                    elif field.displayType == 'button':
                        base_attribs['type'] = 'submit'
                        base_attribs['value'] = field.placeholder
                        base_attribs['class'] = 'btn'


                    # create the html
                    field_html = Tag(tagname, base_attribs, content=content)
                    if field.displayType == 'email-text':
                        decorating_wrapper = Tag('div', {'class': 'input-prepend'}, content=(
                                Tag('span', {'class':'add-on'}, content="@"),
                                field_html))
                        field_html = decorating_wrapper

                    htmls = []

                    # add a label if possible
                    try:
                        if field.label is not None:
                            label = Tag('label', {}, content=field.label)
                            htmls.append(label)
                    except AttributeError:
                        pass

                    htmls.append(field_html)
                    try:
                        error_div = Tag('div', {'class': 'form-error field-name-%s' % field.backend_field_name})
                        htmls.append(error_div)
                    except AttributeError:
                        pass

                    return htmls

            class FormModelField(FormField, DictInited, Resolvable):
                _schema = {
                    "field_name": {"_type": ""},
                    "placeholder": {"_type": ""},
                    "label": {"_type": ""},
                    "displayType": {"_type": ""},
                    "type": {"_type": ""},  # FIXME what is the diff btwn this and the above
                    "options": {"_type": [], "_each": {"_type": ""}}  # XXX what is this, in more detail?
                }

                _resolve_attrs = (('field_name', 'model_field'),)

                def __init__(self, *args, **kwargs):
                    super(Form.FormInfo.FormInfoInfo.FormModelField, self).__init__(*args, **kwargs)
                    self.name = self.field_name
                    assert self.displayType != "button", "If this is a button, please remove the displayType, or the name, or options."

                def set_backend_name(self):
                    self.backend_field_name = self.model_field._django_field_identifier

            class FormNormalField(FormField, DictInited):
                _schema = {
                    "name": {"_type": ""},
                    "placeholder": {"_type": ""},
                    "label": {"_type": ""},
                    "displayType": {"_type": ""},
                    "options": {"_type": [], "_each": {"_type": ""}}  # XXX what is this, in more detail?
                }

                def __init__(self, *args, **kwargs):
                    super(Form.FormInfo.FormInfoInfo.FormNormalField, self).__init__(*args, **kwargs)
                    assert self.displayType != "button", "If this is a button, please remove the displayType, or the name, or options."

                def set_backend_name(self):
                    self.backend_field_name = self.name
                    print "setting name to %s" % self.name

            class ButtonField(FormField, DictInited):
                _schema = {
                    # HACK - if you leave out the name attribute, it automatically becomes a button
                    "placeholder": {"_type": ""},
                }

                def __init__(self, *args, **kwargs):
                    super(Form.FormInfo.FormInfoInfo.ButtonField, self).__init__(*args, **kwargs)
                    self.displayType = 'button'

                def set_backend_name(self):
                    """Just for consistency w other fields"""
                    pass


            def __init__(self, *args, **kwargs):
                super(Form.FormInfo.FormInfoInfo, self).__init__(*args, **kwargs)
                # this is to make a proper path for resolving the field name later
                for f in filter(lambda x: isinstance(x, Form.FormInfo.FormInfoInfo.FormModelField), self.fields):
                    f.field_name = encode_braces('tables/%s/fields/%s' % (self.entity, f.field_name))

            class RelationalAction(object):
                _schema = {
                    "set_fk": {"_type": ""},
                    "to_object": {"_type": ""}
                }
                # in the strings, "this" will refer to the instance of the entity being created in the form
                # set fk could be something like, "this.teacher" or "CurrentUser.mygroup".
                # to object could be something like, "Page.Teacher" or "Page.Group"

            _schema = {
                "entity": {"_type": ""},
                "action": {"_type": ""},
                "fields": {"_type": [], "_each": {"_one_of": [{"_type": FormModelField},{"_type": FormNormalField},{"_type": ButtonField}]}},
                #"goto": {"_type": LinkLang},
                "belongsTo": {"_one_of": [{"_type": ""}, {"_type": None}]},  # TODO may have reference
                "actions": {"_type": [], "_default": [], "_each": {"_type": RelationalAction}}
            }

            _resolve_attrs = (('entity', 'entity_resolved'),)

            def get_actions_as_tuples(self):
                return [(a.set_fk, a.to_object) for a in self.actions]

            def string_ref_to_inst_only(self, s):
                if s.startswith('Page') or s.startswith('Loop'):
                    return ''.join(s.split('.')[:2])
                return s.split('.')[0]


            def get_needed_page_entities(self):
                # collect all refs in actions
                data_refs = ( item for item in tup for tup in self.get_actions_as_tuples() )
                entities = []

                for ref in data_refs:
                    toks = ref.split('.')
                    if toks[0] == 'Page':
                        name_of_type_of_inst_needed_from_page = toks[1]
                        entity = self.app.find('entities/%s' % name, name_allowed=True)
                        entities.append(entity)
                return entities


        _schema = {
            "form": {"_type": FormInfoInfo}
        }

    _schema = {
        "container_info": {"_type": FormInfo}
    }

    def visit_strings(self, f):
        "Translator: This is a form, nothing to do."
        pass

    def set_post_url(self, url):
        self.post_url = url

    def html(self):
        fields = ['{% csrf_token %}']
        for f in self.container_info.form.fields:
            # here is a potentially nice place to put the django model name in.
            f.set_backend_name()
            fields.extend(f.htmls())
        try:
            post_url = self.post_url
        except AttributeError:
            post_url = "ASDFJKWTF"
        attribs = {'method': 'POST',
                  'action': post_url } # TODO fix this.
        # TODO overlap styles here? maybe need a better solution
        form = Tag('form', attribs, content=fields)
        return form

class Node(DictInited, Hooked):  # a uielement with no container_info
    _schema = {
        "content": {"_default": None, "_one_of": [{"_type": None}, {"_type": "", "_default": ""}]},  # TODO may have reference
        # "isSingle": { "_type" : True }, # don't need this because it's implied from tagname
        "content_attribs": {"_type": {}},  # TODO may have reference
        "class_name": {"_type": ""},
        "tagName": {"_type": ""},
    }

    def __init__(self, *args, **kwargs):
        super(Node, self).__init__(*args, **kwargs)
        if self.content is None:
            self.content = ""

    def kwargs(self):
        kw = {}
        kw = deepcopy(self.content_attribs)
        kw['class'] = 'node ' + self.class_name
        return kw

    def visit_strings(self, f):
        #print self.content
        self.content = f(self.content)
        try:
            self.content_attribs['src'] = f(self.content_attribs['src'])
        except KeyError:
            pass

    def html(self):
        try:
            content = self.content()
        except TypeError:
            content = self.content
        tag = Tag(self.tagName, self.kwargs(), content=content)
        return tag

class Iterator(DictInited, Hooked):

    _hooks = ['find or add the needed data to the view']

    class IteratorInfo(DictInited, Resolvable):

        class Query(DictInited):
            _schema = {
                "belongsToUser": {"_type": True},
                "sortAccordingTo": {"_type": ""},
                "numberOfRows": {"_type": 0}
            }

        class Row(DictInited):
            _schema = {
                "isListOrGrid": {"_type": ""},
                "layout": {"_type": Layout},
                "uielements": {"_type": [], "_each": {"_type": Node}},
            }

        _schema = {
            "entity": {"_type": ""},  # TODO may have reference
            "action": {"_type": ""},
            "uielements": {"_type": [], "_each": {"_type": Node}},
            "query": {"_type": Query},
            "row": {"_type": Row}
        }

        _resolve_attrs = (("entity", "entity_resolved"),)

    _schema = {
        "container_info": {"_type": IteratorInfo},
    }
