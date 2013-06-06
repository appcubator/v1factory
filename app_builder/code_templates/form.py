{% set forms = imports['django.forms'] %}

class {% block class_name %}{{ form.identifier }}{% endblock %}({{forms}}.ModelForm):
    model = {{ form.model_id }}

    class Meta:
        included_fields = ({{ form.included_field_string }})
