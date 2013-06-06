
{% set JsonResponse = imports['django.JsonResponse'] %}
{% set login_function = imports['django.auth.login'] %}
{% set request = locals['request'] %}


@require_POST
def {{ fr.identifier }}({{request}}):
    """
    Handles the login action.
    """
    {#redirect_to = "{{ form_receiver.goto_view.view_path() }}"#}

    form = {{ fr.form_id }}(None, data={{request}}.POST)
    if form.is_valid():

        {{login_function}}({{request}}, form.get_user())
        return {{JsonResponse}}() #ajax_redirect(request, redirect_to)

    else:
        return {{JsonResponse}}(errors=form.errors)