{% set forms = imports['django.forms'] %}

class {{ form.identifier }}({{forms}}.ModelForm):
    model = {{ form.model_id }}

    class Meta:
        included_fields = ({{ form.included_field_string }})
