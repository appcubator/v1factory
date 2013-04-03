@require_POST
def {{ form_receiver.identifier() }}(request):
  """Create an object from data from a POST request."""
  obj = {{ form_receiver.model.identifier() }}()
  {% for field in form_receiver.included_fields %}
  obj.{{ field._django_field.identifier() }} = request.POST['{{ field._django_field.identifier() }}']{% endfor %}
  obj.save()
  return redirect('/')
