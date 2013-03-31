class {{ model.identifier() }}(models.Model):{% for f in model.fields.each() %}
  {% include 'model_fields.py' %}{% endfor %}
