{{ query.model.identifier() }}.objects.all(){%
  if query.belongs_to_user
%}.filter({{ query.model.get_user_related_field().identifier() }}=request.user){%
  endif
%}{%
  if (query.sort_on_field != None)
%}.order_by({{ "'" }}{{ query.sort_on_field.identifier() }}{{ "'" }}){%
  endif
%}{%
  if (query.nrows > 0) and (query.nrows != 'All')
%}[:{{ query.nrows }}]{%
  endif
%}
