from django.db import models
from django.contrib.auth.models import User

{% for cls in classes %}
class {{ cls.identifier }}(models.Model):
  {% for f in cls.fields %}
  {% include 'model_field.py' %}
  {% endfor %}
{% endfor %}
