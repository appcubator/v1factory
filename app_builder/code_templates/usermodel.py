{% extends "model.py" %}

{% set models = imports['django.models'] %}
{% set User = imports['django.models.User'] %}
{% set user = locals['user o2o'] %}

{% block class_name %}{{model.user_profile_identifier}}{% endblock %}

    {% block fields %}
    {{ super() }}
    {{user}} = {{models}}.OneToOneField({{User}}, blank=True, null=True) # Application code will ensure this is not null.
    {% endblock %}
