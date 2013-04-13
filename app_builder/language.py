# this is for django models
def evaluate_string(s, model_objects, ... ):

  def process_lang(match):

    s = match.group(1)

    tokens = s.split(" ")
    if tokens[0] == 'loop':
      pass
    elif tokens[0] == 'page':
      pass
    elif tokens[0] == 'current':
      pass

    """
    if single: # this is the "page" case
      return "{{ "+m.identifier().lower()+"."+f.identifier()+" }}"

    else: # this is what the forloop case looks like
      return "{{ item."+f.identifier()+" }}"
    """

  return re.sub(r'\{\{ ?([^ ]+) ?\}\}', process_lang, s)
