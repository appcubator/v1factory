# The high-level

from copy import deepcopy


APP_SCHEMA = { "_type": {}, "_mapping": {
  "name": { "_type" : "", "_minlength": 2, "_maxlength": 255 },
  "info": { "_type": {}, "_mapping":{
    "domain": { "_type":"" },
    "description": { "_type":"" },
    "keywords": { "_type":"" },
  }},
  "users": {}, #USER_SETTINGS_SCHEMA,
  "entities": {}, # ENTITY_SCHEMA,
  "pages": {}, # PAGE_SCHEMA
}}

# Page logic (can do queries).
# Web editor can render the page based on that logic.
# could even have things like importing modules and stuff.

# The details

# User settingss

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
  "forms": FORM_SCHEMA
}}

# Entities

ENTITY_FIELD_SCHEMA = { "_type": [], "_each": { "_type": {}, "_mapping": {
  "name": { "_type" : "" },
  "required": { "_type": False },
  "type": { "_type" : "" }
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



# this is going to get a container_info key later on
UIELEMENT_SCHEMA = { "_type": [],"_each": { "_type": {}, "_mapping": {
  "layout": LAYOUT_SCHEMA,
  "content": { "_type": "" },
}}}

NODE_SCHEMA = { "_type": [],"_each": { "_type": {}, "_mapping": {
  "layout": LAYOUT_SCHEMA,
  "content": { "_type": "" },
}}}

FORM_INFO_SCHEMA = { "_null": True, "_type": {}, "_mapping": {
  "entity": { "_type": "" },
  "action": { "_type": "" },
  "uielements": NODE_SCHEMA
}}

ITERATOR_INFO_SCHEMA = { "_null": True, "_type": {}, "_mapping": {
  "entity": { "_type": "" },
  "action": { "_type": "" },
  "uielements": NODE_SCHEMA # gets filled in by a self reference
}}

UIELEMENT_SCHEMA['container_info'] = { "_one_of": [FORM_INFO_SCHEMA, ITERATOR_INFO_SCHEMA, { "_null": True, "_type": None}] }



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

APP_SCHEMA['_mapping']['users'] = USER_SETTINGS_SCHEMA
APP_SCHEMA['_mapping']['entities'] = ENTITY_SCHEMA
APP_SCHEMA['_mapping']['pages'] = PAGE_SCHEMA
