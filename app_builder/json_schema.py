# The high-level

# TODO don't forget to say update on the dicts

USER_SETTINGS_SCHEMA = {}
ENTITY_SCHEMA = {}
PAGE_SCHEMA = {}

APP_SCHEMA = { "_type": {}, "_mapping": {
  "name": { "_type" : "", "_minlength": 2, "_maxlength": 255 },
  "users": {}, #USER_SETTINGS_SCHEMA,
  "entities": {}, # ENTITY_SCHEMA,
  "pages": {}, # PAGE_SCHEMA
}}

# The details

# User settingss

USER_SETTINGS_SCHEMA = { "_type": {}, "_mapping": {
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
}}

# Entities

ENTITY_FIELD_SCHEMA = { "_type": [], "_each": { "_type": {}, "_mapping": {
  "name": { "_type" : "" },
  "required": { "_type": False },
  "type": { "_type" : "" }
}}}

FORM_SCHEMA = { "_type": [], "_each": { "_type" : {}, "_mapping": {
  "name": { "_type" : "" },
  "action": { "_type":"" },
  "fields": { "_type" : [], "_each": { "_type" : {}, "_mapping": {
    "name": { "_type" : "" },
    "placeholder": { "_type" : "" },
    "label": { "_type" : "" },
    "displayType": { "_type" : "" },
    "type": { "_type" : "" },
    "options": { "_type" : [], "_each": { "_type" : "" }}
  }}},
}}}

ENTITY_SCHEMA = { "_type": [], "_each": { "_type": {}, "_mapping": {
  "name": { "_type" : "" },
  "fields": ENTITY_FIELD_SCHEMA,
  "forms": FORM_SCHEMA
}}}

# Pages

LAYOUT_SCHEMA = { "_type": {}, "_mapping": {
  "width": { "_type": 0, "_min": 1, "_max": 64 },
  "height": { "_type": 0, "_min": 1 },
  "top": { "_type": 0, "_min": 0 },
  "left": { "_type": 0, "_min": 0, "_max": 64 }
}}

UIELEMENT_SCHEMA = { "_type": [],"_each": { "_type": {}, "_mapping": {
  "layout": LAYOUT_SCHEMA,
  "container_info": {},
  "content": { "_type": "" },
}}}

FORM_INFO_SCHEMA = { "_null": True, "_type": {}, "_mapping": {
  "entity": { "_type": "" },
  "action": { "_type": "" },
  "uielements": UIELEMENT_SCHEMA
}}

ITERATOR_INFO_SCHEMA = { "_null": True, "_type": {}, "_mapping": {
  "entity": { "_type": "" },
  "action": { "_type": "" },
  "uielements": UIELEMENT_SCHEMA # gets filled in by a self reference
}}

NODE_SCHEMA = { "_type": [],"_each": { "_type": {}, "_mapping": {
  "layout": LAYOUT_SCHEMA,
  "content": { "_type": "" },
}}}

UIELEMENT_SCHEMA['container_info'] = { "_one_of": [FORM_INFO_SCHEMA, ITERATOR_INFO_SCHEMA, { "_null": True }] }

PAGE_SCHEMA = { "_type": [], "_each": { "_type": {}, "_mapping": {
  "name": { "_type" : "" },
  "url": { "_type": {}, "_mapping": {
    "urlparts": { "_type": [],
      "_each": { "_type" : "" }
    }
  }},
  "uielements": UIELEMENT_SCHEMA,
  "access_level": { "_type" : "" }
}}}

APP_SCHEMA['users'] = USER_SETTINGS_SCHEMA
APP_SCHEMA['entities'] = ENTITY_SCHEMA
APP_SCHEMA['pages'] = PAGE_SCHEMA
