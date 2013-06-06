{% set Client = imports['django.test.Client'] %}
{% set TestCase = imports['django.test.TestCase'] %}

class StaticPagesTestCase({{TestCase}}):

    def setUp(self):
        self.c = {{Client}}()

    {% for identifier, url in test.identifier_url_pairs %}
    def test_{{ identifier }}(self):
        r = self.c.get('{{ url }}')
        self.assertEqual(r.status_code, 200)

    {% endfor %}
