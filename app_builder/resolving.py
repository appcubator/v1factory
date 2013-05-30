from dict_inited import DictInited
from analyzer_utils import encode_braces, decode_braces

class Resolvable(object):

    """
    Mixin allowing you to specify attributes you want to resolve.
    See _resolve_attrs in LinkLang for example.
    """

    def resolve(self):
        assert hasattr(self, 'app'), "You must have something at attribute \"app\""
        for src_attr, dest_attr in self.__class__._resolve_attrs:
            path_string = decode_braces(getattr(self, src_attr))
            setattr(self, dest_attr,  self.app.find(
                path_string, name_allowed=True))


class LinkLang(DictInited, Resolvable):
    _schema = {
        "page_name": {"_type": ""},
        "urldata": {"_type": {}},
        # "page": { "_type": Page"} # DO NOT UNCOMMENT. this gets added after resolve.
    }

    _resolve_attrs = (('page_name', 'page'),)


class EntityLang(DictInited, Resolvable):
    _schema = {"name": {"_type": ""}, "entity_name": {"_type": ""}}
    _resolve_attrs = (('entity_name', 'entity'),)

