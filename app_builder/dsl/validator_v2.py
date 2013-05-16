""" Really cool JSON schema validator """

from copy import deepcopy

def validate_app_state(app_state):
    pass
    """
    assert 'Homepage' in [ p['name'] for p in app_state['pages'] ]
    assert 'Registration Page' in [ p['name'] for p in app_state['pages'] ]
    return validate_dict(app_state, APP_SCHEMA)
    """


class DictInited(object):
    """Base class for dict_inited objects.
    Includes creation code and validation code"""

    _schema = {}

    def __init__(self, **kwargs):
        """Inits this object with the data passed. Very standard."""
        data = kwargs
        assert isinstance(data, dict), "Input to init must be a dict"
        for name, value in data.items():
            setattr(self, name, value)

    @classmethod
    def _recursively_create(cls, thing, schema):
        """Returns the object created version of thing if schema type is a class, else returns thing.
             Does a recursive DFS, mutating as it goes"""

        if '_one_of' in schema:
            for validation_schema in schema['_one_of']: # FIXME there might be more than 1 correct schema, then it's ambiguous
                # try all the schemas until one works. if none work, throw an error and quit.
                new_errs = cls.validate_dict(thing, validation_schema)
                if len(new_errs) == 0:
                    return cls._recursively_create(thing, validation_schema)
            # if you get to this point, none of the "one of" things were valid.
            raise Exception("thing does not ascribe to schema")

        try:
            assert('_type' in schema)
        except Exception:
            raise Exception('schema structure doesn\'t begin with _type')

        if type(schema['_type']) == type(type):
            data = schema['_type']._recursively_create(thing, {"_type":{}, "_mapping":schema['_type']._schema})
            return schema['_type'](**data)

        if type(thing) == type(""):
            thing = unicode(thing)

        assert type(thing) == type(schema['_type']) or (type(thing) == type(u"") and type(schema['_type']) == type("")), "thing does not ascribe to schema"

        if type(thing) == type([]):
            assert('_each' in schema)
            return [ cls._recursively_create(minithing, schema['_each']) for minithing in thing ]

        elif type(thing) == type({}):

            if '_mapping' not in schema:
                return thing

            for key, value in thing.items():
                if key not in schema['_mapping']:
                    del thing[key]
                else:
                    thing[key] = cls._recursively_create(thing[key], schema['_mapping'][key])

            return thing

        elif type(thing) == type(u""):
            return thing

        elif type(thing) == type(0):
            return thing

        elif type(thing) == type(True):
            return thing

        elif thing is None:
            assert(schema['_type'] is None)
            return thing

        else:
            raise Exception("type not recognized: {}".format(thing))

        return thing

    @classmethod
    def create_from_dict(cls, data):
        """
        Validates the data,
          then inits the object recursively.
        """
        assert isinstance(data, dict), "Input to \"created_from_dict\" must be a dict"
        errors = cls.validate_dict(data, {"_type":cls})
        if len(errors) == 0:
            data = deepcopy(data)
            o = cls._recursively_create(data, {"_type":cls}) # helper function needed for schema based recursion
            return o

        else:
            return errors
            raise Exception("Errors while creating %s" % cls.__name__)

    @classmethod
    def validate_dict(cls, thing, schema):
        """Return a list of error messages. if there are no errors, the thing successfully validate_dict, no problemo."""

        errors = []

        if '_one_of' in schema:
            min_num_err = None
            min_err_err = None
            for validation_schema in schema['_one_of']:
                new_errs = cls.validate_dict(thing, validation_schema)
                if len(new_errs) == 0:
                    return errors # no point in extending new_errors since it's blank
                if min_num_err is None:
                    min_num_err = len(new_errs)
                    min_err_err = new_errs
                    continue
                if len(new_errs) < min_num_err:
                    min_err_err = new_errs
                    min_num_err = len(new_errs)
            # if you get to this point, none of the "one of" things were valid.
            errors.append("None of the _one_of things matched.\n\nthing: {}\n\nschema:{}.\n\nMost likely errors: {}".format(repr(thing), schema, str(min_err_err)))
            return errors
        assert '_one_of' not in schema

        # make sure the type of the thing matches with the schema
        try:
            assert('_type' in schema)
        except Exception:
            raise Exception('schema structure doesn\'t begin with _type')

        if type(schema['_type']) == type(type):
            return cls.validate_dict(thing, {"_type":{}, "_mapping":schema['_type']._schema})


        if type(thing) == type(""):
            thing = unicode(thing)

        try:
            assert type(thing) == type(schema['_type']) or (type(thing) == type(u"") and type(schema['_type']) == type(""))
        except Exception:
            errors.append("type of this thing doesn't match schema.\n\n\nthing: {}\n\n\nschema:{}".format(repr(thing), schema))
            return errors

        if type(thing) == type([]):
            try: assert('_each' in schema)
            except Exception: raise Exception('found [] with no _each')
            for minithing in thing:
                errors.extend(cls.validate_dict(minithing, schema['_each']))

        elif type(thing) == type({}):

            if '_mapping' not in schema:
                return errors

            for key in schema['_mapping']:
                try: assert(key in thing)
                except Exception:
                    errors.append('found a key in the schema which is not part of thing. "{}", {}'.format(key, thing))
                else:
                    errors.extend(cls.validate_dict(thing[key], schema['_mapping'][key]))

        elif type(thing) == type("") or type(thing) == type(u""):
            if "_minlength" in schema:
                try: assert(len(thing) >= schema["_minlength"])
                except Exception: errors.append('string length was less than minlength: \"{}\", minlength={}'.format(repr(thing), schema['_minlength']))
            if "_maxlength" in schema:
                try: assert(len(thing) <= schema["_maxlength"])
                except Exception: errors.append('string length was greater than maxlength: \"{}\", maxlength={}'.format(repr(thing), schema['_maxlength']))

        elif type(thing) == type(0):
            if "_min" in schema:
                try: assert(thing >= schema["_min"])
                except Exception: errors.append('int was less than min: \"{}\", min={}'.format(repr(thing), schema['_min']))
            if "_max" in schema:
                try: assert(thing <= schema["_max"])
                except Exception: errors.append('int was greater than max: \"{}\", max={}'.format(repr(thing), schema['_max']))

        elif type(thing) == type(True):
            pass

        elif thing is None:
            try: assert(schema['_type'] is None)
            except Exception: raise Exception("thing was null but wasn't supposed to be.\n\n\nschema:{}".format(repr(thing), schema))
            else: return errors


        else:
            raise Exception("type not recognized: {}".format(thing))

        return errors

