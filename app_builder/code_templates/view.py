@require_GET
def {{ view.identifier }}(request{% for arg, data in view.args %}, {{ arg }}{% endfor %}):
    page_context = {}
                                                            {# url context #}
    {% for arg, arg_data in view.args %}
    page_context['{{ arg_data.template_id }}'] = get_object_or_404({{ arg_data.model_id }}, pk={{ arg }})
    {% endfor %}

                                                            {# queries #}
    {% for template_id, query in view.queries %}
    page_context['{{ template_id }}'] = {{ query }}
    {% endfor %}

    return render(request, "{{ view.template_code_path }}", page_context)
