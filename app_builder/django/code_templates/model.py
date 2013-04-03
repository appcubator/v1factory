class {{ model.identifier() }}(models.Model):{% for f in model.fields.each() %}
  {{ f.render() }}{% endfor %}
