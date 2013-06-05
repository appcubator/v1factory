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
            return []


class Form(DictInited, Hooked):

    # these are tightly coupled and serial for now.
    _hooks = ['create form object',
              'import form into form receivers',
              'create form receiver',
              'create url for form receiver']

    class FormInfo(DictInited):

        class FormInfoInfo(DictInited, Resolvable):

            class FormField(object):

                def htmls(field):
                    if field.displayType == 'single-line-text':
                        f = Tag('input', {'type':'text', 'placeholder':field.placeholder})
                    elif field.displayType == 'paragraph-text':
                        f = Tag('textarea', {}, content=field.placeholder)
                    elif field.displayType == 'password-text':
                        f = Tag('input', {'type':'password', 'placeholder':field.placeholder})
                    elif field.displayType == 'email-text':
                        f = Tag('div', {'class': 'input-prepend'}, content=(
                                Tag('span', {'class':'add-on'}, content="@"),
                                Tag('input', {'type': 'text'})))
                    elif field.displayType == 'button':
                        f = Tag('input', {'type': 'submit', 'value': field.placeholder, 'class': "btn" })
                    else:
                        raise Exception("Formfield NYI")

                    try:
                        if field.label is not None:
                            label = Tag('label', {}, content=field.label)
                            return (label, f)
                    except AttributeError:
                        pass
                    return (f,)

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

            class FormNormalField(FormField, DictInited, Resolvable):
                _schema = {
                    "name": {"_type": ""},
                    "placeholder": {"_type": ""},
                    "label": {"_type": ""},
                    "displayType": {"_type": ""},
                    "type": {"_type": ""},  # FIXME what is the diff btwn this and the above
                    "options": {"_type": [], "_each": {"_type": ""}}  # XXX what is this, in more detail?
                }
                _resolve_attrs = (('field_name', 'model_field'),)

            class ButtonField(FormField, DictInited):
                _schema = {
                    # HACK - if you leave out the name attribute, it automatically becomes a button
                    "placeholder": {"_type": ""},
                }

                def __init__(self, *args, **kwargs):
                    super(Form.FormInfo.FormInfoInfo.ButtonField, self).__init__(*args, **kwargs)
                    self.displayType = 'button'


            def __init__(self, *args, **kwargs):
                super(Form.FormInfo.FormInfoInfo, self).__init__(*args, **kwargs)
                # this is to make a proper path for resolving the field name later
                for f in filter(lambda x: isinstance(x, Form.FormInfo.FormInfoInfo.FormModelField), self.fields):
                    f.field_name = encode_braces('entities/%s/fields/%s' % (self.entity, f.field_name))

            _schema = {
                "entity": {"_type": ""},
                "action": {"_type": ""},
                "fields": {"_type": [], "_each": {"_one_of": [{"_type": FormModelField},{"_type": ButtonField}]}},
                #"goto": {"_type": LinkLang},
                "belongsTo": {"_one_of": [{"_type": ""}, {"_type": None}]}  # TODO may have reference
            }

            _resolve_attrs = (('entity', 'entity_resolved'),)

        _schema = {
            "form": {"_type": FormInfoInfo}
        }

    _schema = {
        "container_info": {"_type": FormInfo}
    }

    def html(self):
        fields = ['{% csrf_token %}']
        for f in self.container_info.form.fields:
            fields.extend(f.htmls())
        attribs = {'method': 'POST',
                  'action': '/' } # TODO fix this.
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
        content = self.content
        self.content = lambda: content

    def kwargs(self):
        kw = {}
        kw = deepcopy(self.content_attribs)
        kw['class'] = 'node ' + self.class_name
        return kw

    def html(self):
        tag = Tag(self.tagName, self.kwargs(), content=self.content())
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
