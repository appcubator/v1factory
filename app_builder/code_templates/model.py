{% set models = imports['django.models'] %}

class {{model.identifier}}({{models}}.Model):
    {% for f in model.fields %}
    {{ f.identifier }} = {{models}}.{{ f.django_type }}({% for a in f.args %}{{ a }}, {% endfor %}{% for k,v in f.kwargs().items() %}{{ k }}={{ v }}{% if not loop.last %}, {% endif %}{% endfor %})
    {% endfor %}
