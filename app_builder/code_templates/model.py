from django.db import models

class {{ model.identifier }}(models.Model):
{% for f in model.fields %}
    {{ f.identifier }} = models.{{ f.django_type }}({% for a in f.args %}{{ a }}, {% endfor %}{% for k,v in f.kwargs().items() %}{{ k }}={{ v }}, {% endfor %})
{% endfor %}
