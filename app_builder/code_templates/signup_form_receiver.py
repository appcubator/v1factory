
{% set JsonResponse = imports['django.JsonResponse'] %}
{% set login_function = imports['django.auth.login'] %}
{% set authenticate_function = imports['django.auth.authenticate'] %}
{% set request = locals['request'] %}

@require_POST
def {{ fr.identifier }}({{request}}):
    """Create a User object"""
    uform = {{fr.form_id}}({{request}}.POST)
    {#pform = {{fr.user_profile_form_id}}({{request}}.POST)#}
    if uform.is_valid():
        {#} and pform.is_valid():#}
        user = uform.save()
        {#
        profile = pform.save(commit=False)
        profile.user = user
        profile.save()#}

        new_user = {{authenticate_function}}(username={{request}}.POST['username'],
                                                        password={{request}}.POST['password1'])
        {{login_function}}({{request}}, new_user)
        return {{JsonResponse}}(data={})
        {#ajax_redirect(request, "{{ form_receiver.goto_view.view_path() }}")
        #}
    else:
        errors = {}
        errors.update(uform.errors)
        {#errors.update(pform.errors)
        #}
        return {{JsonResponse}}(errors=errors)