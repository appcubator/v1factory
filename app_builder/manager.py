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
      try:
        if o.name == name:
          return o
      except Exception:
        pass
      try:
        if o['name'] == name:
          return o
      except Exception:
        pass

    return None

  def _add_unchecked(self, instance):
    self._objects.append(instance)

  def add(self, instance):
    """
    Add an object to this manager if it's the correct type, and avoid duplicates.
    """
    if not isinstance(instance, self._parent_class):
      raise Exception("Object and manager types do not agree")
    elif self.get_by_name(instance.name) is not None:
      raise Exception("Object with this name already exists in the manager")
    else:
      self._add_unchecked(instance)

  def each(self):
    for i in self._objects:
      yield i
