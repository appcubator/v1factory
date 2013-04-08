@require_POST
def {{ form_receiver.identifier() }}(request{% for m in form_receiver.url.model_refs() %}, {{ m.foreign_key_name() }}{% endfor %}):
  """Create an object from data from a POST request."""
  obj = {{ form_receiver.model.identifier() }}()
{% for field in form_receiver.included_fields %}
  obj.{{ field._django_field.identifier() }} = request.POST['{{ field._django_field.identifier() }}']
{% endfor %}
{% for field in form_receiver.foreign_key_fields %}
  obj.{{ field._django_field.identifier() }} = long(request.POST['{{ field._django_field.identifier() }}'])
{% endfor %}
  obj.save()
  return ajax_redirect(request, '/')
