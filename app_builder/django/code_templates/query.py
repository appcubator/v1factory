{{ query.model.identifier() }}.objects.all()\
  {% if query.belongs_to_user %}.filter({{ query.model.get_user_related_field().identifier() }}=request.user)\{{ endif }}
{% endif %}
