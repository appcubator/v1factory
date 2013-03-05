from django.db import models
from django.contrib.auth.models import User

{% for cls in classes %}
class {{ cls.identifier() }}(models.Model):
  {% for f in cls.fields.each() %}
  {% include 'model_fields.py' %}
  {% endfor %}
{% endfor %}
