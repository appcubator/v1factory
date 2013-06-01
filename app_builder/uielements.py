from dict_inited import DictInited
from app_builder.resolving import Resolvable, LinkLang
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
        "font-size": {"_type": "", "_default": ""}, #TODO
    }


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

    class FormInfo(DictInited, Resolvable):

        class FormInfoInfo(DictInited):

            class FormField(DictInited):
                _schema = {
                    "name": {"_type": ""},
                    "placeholder": {"_type": ""},
                    "label": {"_type": ""},
                    "displayType": {"_type": ""},
                    "type": {"_type": ""},  # FIXME what is the diff btwn this and the above
                    "options": {"_type": [], "_each": {"_type": ""}}  # XXX what is this?
                }

            _schema = {
                "name": {"_type": ""},
                "action": {"_type": ""},
                "fields": {"_type": [], "_each": {"_type": FormField}},
                #"goto": {"_type": LinkLang},
                "belongsTo": {"_one_of": [{"_type": ""}, {"_type": None}]}  # TODO may have reference
            }

        _schema = {
            "entity": {"_type": ""},
            "action": {"_type": ""},
            "form": {"_type": FormInfoInfo}
        }

        _resolve_attrs = (('entity', 'entity_resolved'),)

    _schema = {
        "container_info": {"_type": FormInfo}
    }

    def render(self):
        self.method = 'POST'
        self.action = '(url to form receiver)' # TODO '{%  url %s %}' % context.form_receiver.view_path()
        return env.get_template('form.html').render(form=self)


class Node(DictInited, Hooked):  # a uielement with no container_info
    _schema = {
        "content": {"_type": ""},  # TODO may have reference
        # "isSingle": { "_type" : True }, # don't need this because it's implied from tagname
        "content_attribs": {"_type": {}},  # TODO may have reference
        "class_name": {"_type": ""},
        "tagName": {"_type": ""},
    }

    def __init__(self, *args, **kwargs):
        super(Node, self).__init__(*args, **kwargs)
        content = self.content
        self.content = lambda: content


    def padding_string(self):
        return "padding: %dpx %dpx %dpx %dpx;" % (
            self.layout.t_padding, self.layout.r_padding, self.layout.b_padding, self.layout.l_padding)

    def kwargs(self):
        kw = {}
        kw = deepcopy(self.content_attribs)
        kw['class'] = 'node ' + self.class_name
        return kw

    def render(self):
        wrapper_style = 'text-align:%s' % self.layout.alignment
        try:
            wrapper_style += self.overlap_styles
        except AttributeError:
            pass
        wrapper_style += self.padding_string()
        wrapper_kwargs = { 'class': 'node-wrapper',
                           'style': wrapper_style
                           }
        wrapper = Tag('div', wrapper_kwargs, content=Tag(
            self.tagName, self.kwargs(), content=self.content))
        return wrapper.render()


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


"""
        # on init, this object should get a reference to namespaces so that it can
        # reference built in models, views, and form receivers (ie, create user side effects)

        def render(self):
            # this is where the HTML generation code goes
            pass

        def add_to_view(self):
            # this is where you figure out what you need to add the the view function which creates the page context
            pass

        def create_form_receivers(self):
            # make some form receivers here if you need to communicate with the server.
            pass

        def javascript(self):
            # generate some javascript here if you need to add javascript to the page
            pass

"""
