"""

CurrentUser.<property_of_user>+  (need to be passed in entities)             =>              some thing in the app.
Page.<name of ent>.<property_of_ent>+   (need to be passed in entities and page)       =>       some thing in the app (entity or field)

NYI: Loop.
"""


class Translator(object):
    """
    Given some entities, translates CurrentUser.<props>+ and Page.<ent>.<props>+ to their App counterpart.
    """

    def __init__(self, entities):
        self.entities = entities

    def v1script_to_app_component(self, s, page=None):
        tokens = s.split('.')
        if tokens[0] == 'CurrentUser':
            ent = filter(lambda e: e.is_user, self.entities)
            # ent is the type, the instance is the currently logged in user
            # in view function, it's request.user. <whatever>
            # in template, it's user. <whatever>

        elif tokens[0] == 'Page':
            ent = entities.app.find('entities/%s' % tokens[1], name_allowed=True)
            assert page is not None, "Plz provide a page to the function for %r" % s
            # get the entity from the page which matches the type  
            
        else:
            raise Exception("Not Yet Implemented: %r" % s)
        pass