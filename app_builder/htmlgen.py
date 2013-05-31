from copy import deepcopy
from jinja2 import Environment, PackageLoader, StrictUndefined

env = Environment(trim_blocks=True, lstrip_blocks=True, loader=PackageLoader(
    'app_builder.code_templates', 'htmlgen'), undefined=StrictUndefined, autoescape=True)

valid_tags = ('a', 'abbr', 'address', 'area', 'article',
              'aside', 'audio', 'b', 'base', 'bdi',
              'bdo', 'blockquote', 'body', 'br', 'button',
              'canvas', 'caption', 'cite', 'code', 'col',
              'colgroup', 'command', 'data', 'datalist', 'dd',
              'del', 'details', 'dfn', 'div', 'dl',
              'dt', 'em', 'embed', 'fieldset', 'figcaption',
              'figure', 'footer', 'form', 'head', 'header',
              'hr', 'html', 'i', 'iframe', 'img', 'input',
              'ins', 'kbd', 'keygen', 'label', 'legend',
              'li', 'link', 'main', 'map', 'mark',
              'menu', 'meta', 'meter', 'nav', 'noscript',
              'object', 'ol', 'optgroup', 'option', 'output',
              'p', 'param', 'pre', 'progress', 'q',
              'rp', 'rt', 'ruby', 's', 'samp', 'script',
              'section', 'select', 'small', 'source', 'span',
              'strong', 'style', 'sub', 'summary', 'sup',
              'table', 'tbody', 'td', 'textarea', 'tfoot',
              'th', 'thead', 'time', 'title', 'tr', 'track',
              'u', 'ul', 'var', 'video', 'wbr')

void_tags = ('area', 'base', 'br', 'col', 'embed', 'hr',
             'img', 'input', 'keygen', 'link', 'menuitem',
             'meta', 'param', 'source', 'track', 'wbr')


class Tag(object):

    def __init__(self, tagName, attribs, content=None):
        assert tagName in valid_tags, "Invalid tagName %r" % tagName
        self.tagName = tagName
        self.id_string = attribs.get('id', '')
        self.class_string = attribs.get('class', '')
        self.style_string = attribs.get('style', '')
        attribs = deepcopy(attribs)
        try:
            del attribs['id']
        except KeyError:
            pass
        try:
            del attribs['class']
        except KeyError:
            pass
        try:
            del attribs['style']
        except KeyError:
            pass
        self.attribs = attribs
        self._content = content

        self.isSingle = self.tagName in void_tags

    def content(self):
        if self._content is None:
            return ""
        assert not self.isSingle, "Content doesn't work for single tags"
        if isinstance(self._content, basestring):
            return self._content
        try:
            return self._content.render()
        except AttributeError:
            return '\n'.join([c.render() for c in self._content])

    def render(self):
        return env.get_template('htmltag.html').render(context=self)

