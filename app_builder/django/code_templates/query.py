{% if v.query.belongs_to_user %} {{ v.model.objects.values(v.query.field_names).filter(user_id=request.user).order_by('?') }} {% else %} {{ v.model.objects.values(v.query.field_names).order_by('?') }}
{% endif %}
