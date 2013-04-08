def get_name(instance):
  """Either a dict or object, get name"""
  try:
    return instance.name
  except Exception:
    return instance['name']


class Manager:
  """
  Manages a collection of objects
  """

  def __init__(self, parent_class):
    self._parent_class = parent_class
    self._objects = []

  def get_by_name(self, name):
    """
    Given the name of the object, returns the object. Assumes uniqueness on name.
    """
    for o in self._objects:
      if get_name(o) == name:
        return o

    return None

  def get_by_attr(self, attr_name, value):

    for o in self._objects:
      assert hasattr(o, attr_name), "Called get by field but field name not valid here"
      if getattr(o, attr_name) == value:
        return o

    return None

  def _add_unchecked(self, instance):
    self._objects.append(instance)

  def add(self, instance):
    """
    Add an object to this manager if it's the correct type, and avoid duplicates.
    """
    if not isinstance(instance, self._parent_class):
      raise Exception("Object and manager types do not agree")
    elif self.get_by_name(get_name(instance)) is not None:
      raise Exception("Object with this name already exists in the manager")
    else:
      self._add_unchecked(instance)

  def each(self):
    for i in self._objects:
      yield i
