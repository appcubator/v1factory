""" Really cool JSON schema validator """

def validate(thing, schema):
  """Return a list of error messages. if there are no errors, the thing successfully validated, no problemo."""
  errors = []

  #  if the thing is null, see if it's allowed to be null, and if it is, let it pass
  if thing is None:
    try: assert('_null' in schema and schema['_null'])
    except Exception: raise Exception("thing was null but wasn't supposed to be.\n\n\nthing: {}\n\n\nschema:{}".format(repr(thing), schema))
    else: return errors

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

def validate_app_state(app_state):
  assert 'Homepage' in [ p['name'] for p in app_state['pages'] ]
  assert 'Registration Page' in [ p['name'] for p in app_state['pages'] ]
  return validate(app_state, APP_SCHEMA)
