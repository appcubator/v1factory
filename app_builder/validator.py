""" Really cool JSON schema validator """


def validate(thing, schema):
  """Return a list of error messages. if there are no errors, the thing successfully validated, no problemo."""
  errors = []

  #  if the thing is null, see if it's allowed to be null, and if it is, let it pass
  if thing is None:
    try: assert('_null' in schema and schema['_null'])
    except Exception: raise Exception("thing was null but wasn't supposed to be.\n\n\nschema:{}".format(repr(thing), schema))
    else: return errors

  if '_one_of' in schema:
    for validation_schema in schema['_one_of']:
      # try all the schemas until one works. if none work, throw an error and quit.
      print "i'm in one_of"
      new_errs = validate(thing, validation_schema)
      if len(new_errors) == 0:
        return errors # no point in extending new_errors since it's blank
    # if you get to this point, none of the "one of" things were valid.
    errors.append("None of the _one_of things matched.\n\n\nthing: {}\n\n\nschema:{}".format(repr(thing), schema))
    return errors
  assert '_one_of' not in schema

  # make sure the type of the thing matches with the schema
  try:
    assert('_type' in schema)
  except Exception:
    raise Exception('schema structure doesn\'t begin with _type')

  if type(thing) == type(u""):
    thing = str(thing)

  try:
    assert(type(thing) == type(schema['_type']))
  except Exception:
    errors.append("type of this thing doesn't match schema.\n\n\nthing: {}\n\n\nschema:{}".format(repr(thing), schema))
    return errors

  if type(thing) == type([]):
    try: assert('_each' in schema)
    except Exception: raise Exception('found [] with no _each')
    for minithing in thing:
      errors.extend(validate(minithing, schema['_each']))

  elif type(thing) == type({}):

    try: assert('_mapping' in schema)
    except Exception: raise Exception('found {} with no _mapping')

    for key in schema['_mapping']:
      try: assert(key in thing)
      except Exception:
        errors.append('found a key in the schema which is not part of thing. "{}", {}'.format(key, thing))
      else:
        errors.extend(validate(thing[key], schema['_mapping'][key]))

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

  else:
    raise Exception("type not recognized: {}".format(thing))

  return errors

from dsl.json_schema import APP_SCHEMA
def validate_app_state(app_state):
  assert 'Homepage' in [ p['name'] for p in app_state['pages'] ]
  assert 'Registration Page' in [ p['name'] for p in app_state['pages'] ]
  return validate(app_state, APP_SCHEMA)
