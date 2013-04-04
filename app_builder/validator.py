""" Really cool JSON schema validator """

APP_SCHEMA = { "_type": {}, "_mapping": {
  "name":{
          "_type" : "",
          "_minlength": 2,
          "_maxlength": 255,
         },
  "users": {
            "_type": {},
            "_mapping": {
                        "facebook": { "_type": True },
                        "linkedin": { "_type": True },
                        "twitter": { "_type": True },
                        "local": { "_type": True },
                        "fields": {
                                   "_type": [],
                                   "_each": { "_type": {}, "_mapping": {
                                             "name": { "_type" : "" },
                                             "required": { "_type": False },
                                             "type": { "_type" : "" }
                                            }}
                                  },
                        "forms": { "_type": [], "_each": { "_type" : {}, "_mapping": {
                                  "name": { "_type" : "" },
                                  "fields": { "_type" : [], "_each": { "_type" : {}, "_mapping": {
                                             "name": { "_type" : "" },
                                             "placeholder": { "_type" : "" },
                                             "label": { "_type" : "" },
                                             "displayType": { "_type" : "" },
                                             "type": { "_type" : "" },
                                             "options": { "_type" : [], "_each": { "_type" : "" }}
                                            }}},
                                  "action": { "_type":"" }
                                 }}}
                        }
           },
  "entities": { "_type": [], "_each": {
               "_type": {},
               "_mapping": {
                            "name": { "_type" : "" },
                            "fields": {
                                       "_type": [],
                                       "_each": { "_type": {}, "_mapping": {
                                                 "name": { "_type" : "" },
                                                 "required": { "_type": False },
                                                 "type": { "_type" : "" }
                                                }}
                                      },
                            "forms": { "_type": [], "_each": { "_type" : {}, "_mapping": {
                                      "name": { "_type" : "" },
                                      "fields": { "_type" : [], "_each": { "_type" : {}, "_mapping": {
                                                 "name": { "_type" : "" },
                                                 "placeholder": { "_type" : "" },
                                                 "label": { "_type" : "" },
                                                 "displayType": { "_type" : "" },
                                                 "type": { "_type" : "" },
                                                 "options": { "_type" : [], "_each": { "_type" : "" }}
                                                }}},
                                      "action": { "_type":"" }
                                     }}}
                           }
               }},
  "pages": { "_type": [], "_each": {
            "_type": {},
            "_mapping": {
                         "name": { "_type" : "" },
                         "url": { "_type": {}, "_mapping": {
                                 "urlparts": {
                                              "_type": [],
                                              "_each": { "_type" : "" }
                                             }
                                }},
                         "design_props": {
                                          "_type": [],
                                          "_each": { "_type": {}, "_mapping": {
                                                    "type": { "_type": "" },
                                                    "value": { "_type": "" }
                                                   }}
                                         },
                         "uielements": {
                                        "_type": [],
                                        "_each": { "_type": {}, "_mapping": {
                                                  "layout": {
                                                             "_type": {},
                                                             "_mapping": {
                                                                          "width": { "_type": 0, "_min": 1, "_max": 64 },
                                                                          "height": { "_type": 0, "_min": 1 },
                                                                          "top": { "_type": 0, "_min": 0 },
                                                                          "left": { "_type": 0, "_min": 0, "_max": 64 }
                                                                         }
                                                            },
                                                  "content": { "_type": "" },
                                                  "container_info": {
                                                                     "_null": True,
                                                                     "_type": {},
                                                                     "_mapping": {
                                                                                  "entity": { "_type": "" },
                                                                                  "action": { "_type": "" },
                                                                                  "uielements": {
                                                                                                 "_type": [],
                                                                                                 "_each": { "_type": {}, "_mapping": {
                                                                                                           "layout": {
                                                                                                                      "_type": {},
                                                                                                                      "_mapping": {
                                                                                                                                   "width": { "_type": 0, "_min": 1, "_max": 64 },
                                                                                                                                   "height": { "_type": 0, "_min": 1 },
                                                                                                                                   "top": { "_type": 0, "_min": 0 },
                                                                                                                                   "left": { "_type": 0, "_min": 0, "_max": 64 }
                                                                                                                                  }
                                                                                                                     },
                                                                                                           "content": { "_type": "" },
                                                                                                           }}
                                                                                                 },
                                                                                 }
                                                                    },
                                                 }},
                                       },
                         "access_level": { "_type" : "" }
                        }
           }}
}}

class Xception(Exception):

  def __init__(self, value):
    self.message = value

  def __str__(self):
    return str(self.message)

def validate(thing, schema):
  """Return a list of error messages. if there are no errors, the thing successfully validated, no problemo."""
  errors = []

  #  if the thing is null, see if it's allowed to be null, and if it is, let it pass
  if thing is None:
    try: assert('_null' in schema and schema['_null'])
    except Exception: raise Xception("thing was null but wasn't supposed to be.\n\n\nthing: {}\n\n\nschema:{}".format(repr(thing), schema))
    else: return errors

  # make sure the type of the thing matches with the schema
  try:
    assert('_type' in schema)
  except Exception:
    raise Xception('schema structure doesn\'t begin with _type')

  if type(thing) == type(u""):
    thing = str(thing)

  try:
    assert(type(thing) == type(schema['_type']))
  except Exception:
    errors.append("type of this thing doesn't match schema.\n\n\nthing: {}\n\n\nschema:{}".format(repr(thing), schema))
    return errors

  if type(thing) == type([]):
    try: assert('_each' in schema)
    except Exception: raise Xception('found [] with no _each')
    for minithing in thing:
      errors.extend(validate(minithing, schema['_each']))

  elif type(thing) == type({}):

    try: assert('_mapping' in schema)
    except Exception: raise Xception('found {} with no _mapping')

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
    raise Xception("type not recognized: {}".format(thing))

  return errors

def validate_app_state(app_state):
  assert 'Homepage' in [ p['name'] for p in app_state['pages'] ]
  assert 'Registration Page' in [ p['name'] for p in app_state['pages'] ]
  return validate(app_state, APP_SCHEMA)
