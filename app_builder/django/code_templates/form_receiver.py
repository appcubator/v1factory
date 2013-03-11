@require_POST
def {{ form_receiver.identifier() }}(request):
  """Create an object from data from a POST request."""
  obj = {{ form_receiver.model.identifier() }}()
  {% for field in form_receiver.included_fields %}
  obj.{{ field.identifier() }} = request.POST['{{ field.name }}']{% endfor %}
  obj.save()
  return redirect('/')
