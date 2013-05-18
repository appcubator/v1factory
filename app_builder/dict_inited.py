""" Really cool JSON schema validator """

from copy import deepcopy

class ValidationError(object):
    """Represents a validation error"""

    def __init__(self, msg, thing, schema, ancestor_list):
        self.msg = msg
        self.thing = thing
        self.schema = schema
        self.path = '/'.join([str(i) for i in ancestor_list])

    def __unicode__(self):
        return u"Error found in %r: %r\n(Thing, Schema) = %r" % (self.path, self.msg, (self.thing, self.schema))



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
                new_errs = cls.validate_dict(thing, validation_schema, [])
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
        errors = cls.validate_dict(data, {"_type":cls}, [])
        if len(errors) != 0:
            raise Exception(errors)

        data = deepcopy(data)
        o = cls._recursively_create(data, {"_type":cls}) # helper function needed for schema based recursion
        #o._process_lang_strings(cls._schema)
        return o

    def _process_lang_strings(self, schema):
        for k in schema:
            if '_one_of' in schema:
                min_num_err = None
                min_err_err = None
                for validation_schema in schema['_one_of']:
                    #new_errs = self.__class__.validate_dict({}, validation_schema, [])
                    new_errs = [] # FIXME
                    if len(new_errs) == 0:
                        return self._process_lang_strings(validation_schema)
                    if min_num_err is None:
                        min_num_err = len(new_errs)
                        min_err_err = new_errs
                        continue
                    if len(new_errs) < min_num_err:
                        min_err_err = new_errs
                        min_num_err = len(new_errs)
                # if you get to this point, none of the "one of" things were valid.
                raise Exception("Invalid schema")
            elif type(schema['_type']) in [str, unicode]:
                pass
                # string replace the right thing
            elif type(schema['_type']) == dict:
                pass
                # recurse


    @classmethod
    def validate_dict(cls, thing, schema, ancestor_list):
        """Return a list of error messages. if there are no errors, the thing successfully validate_dict, no problemo."""

        errors = []

        if '_one_of' in schema:
            sub_errors = []
            for validation_schema in schema['_one_of']:
                new_errs = cls.validate_dict(thing, validation_schema, ancestor_list)
                sub_errors.extend(new_errs)
                if len(new_errs) == 0:
                    return errors
            # if you get to this point, none of the "one of" things were valid.
            errors.extend(sub_errors)
            #errors.append(ValidationError("None of the _one_of things matched.", thing, schema, ancestor_list))
            return errors
        assert '_one_of' not in schema

        # make sure the type of the thing matches with the schema
        try:
            assert('_type' in schema)
        except Exception:
            raise Exception('schema structure doesn\'t begin with _type')

        if type(schema['_type']) == type(type):
            return cls.validate_dict(thing, {"_type":{}, "_mapping":schema['_type']._schema}, ancestor_list)


        if type(thing) == type(""):
            thing = unicode(thing)

        try:
            assert type(thing) == type(schema['_type']) or (type(thing) == type(u"") and type(schema['_type']) == type(""))
        except AssertionError:
            errors.append(ValidationError("Type mismatch", thing, schema, ancestor_list))
            return errors

        if type(thing) == type([]):
            assert '_each' in schema, 'found [] with no _each'
            for idx, minithing in enumerate(thing):
                ancestor_list.append(idx)
                errors.extend(cls.validate_dict(minithing, schema['_each'], ancestor_list))
                ancestor_list.pop()

        elif type(thing) == type({}):

            if '_mapping' not in schema:
                return errors

            for key in schema['_mapping']:
                if key not in thing and '_default' in schema['_mapping'][key]:
                    thing[key] = schema['_mapping'][key]['_default']
                if key not in thing:
                    errors.append(ValidationError("Key not found: %r" % key, thing, schema, ancestor_list))
                else:
                    ancestor_list.append(key)
                    errors.extend(cls.validate_dict(thing[key], schema['_mapping'][key], ancestor_list))
                    ancestor_list.pop()

        elif type(thing) == type("") or type(thing) == type(u""):
            if "_minlength" in schema:
                if not (len(thing) >= schema["_minlength"]):
                    errors.append(ValidationError('String was shorter than _minlength', thing, schema, ancestor_list))
            if "_maxlength" in schema:
                if not (len(thing) <= schema["_maxlength"]):
                    errors.append(ValidationError('String was longer than _maxlength', thing, schema, ancestor_list))

        elif type(thing) == type(0):
            if "_min" in schema:
                if not (thing >= schema["_min"]):
                    errors.append(ValidationError('int was less than min', thing, schema, ancestor_list))
            if "_max" in schema:
                if not (thing <= schema["_max"]):
                    errors.append(ValidationError('int was greater than max', thing, schema))

        elif type(thing) == type(True):
            pass

        elif thing is None:
            try: assert(schema['_type'] is None)
            except Exception: raise Exception("thing was null but wasn't supposed to be.\n\n\nschema:{}".format(repr(thing), schema))
            else: return errors


        else:
            raise Exception("type not recognized: {}".format(thing))

        return errors

