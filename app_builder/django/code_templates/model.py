class {{ model.identifier() }}(models.Model):
{% for f in model.fields.each() %}
  {{ f.render() }}
{% endfor %}

{% if model.identifier() == "UserProfile" %}
def upload_user_excel(upldr):

  created_cnt = 0
  updated_cnt = 0
  errors = []

  field_name_map = {   # will be used for setting attributes later
    {% for f in model.fields.each() %}
    "{{ f.name }}": "{{ f.identifier() }}",
    {% endfor %}
    "password": "password"
  }

  human_readable_entity_field_names = [{% for f in model.fields.each() %}"{{ f.name }}", {% endfor %}"password"]

  common_fields = determine_common_fields(upldr, human_readable_entity_field_names)
  assert 'username' in common_fields

  data = upldr.extract_data(common_fields)

  password_present = "password" in common_fields

  # For each row in the excel data
  for entry in data:

    # Try to get the user, create if not exists
    try:
      user = User.objects.get(username=entry['username'])
      userprofile = user.get_profile()
      newly_created_user = False # bookkeeping in case error happens, will have to delete the user
    except User.DoesNotExist:
      if not password_present:
        errors.append("User with username not found, and cannot create user without a password field.")
        continue
      user = User.objects.create_user(entry['username'], "", entry['password'])
      userprofile = UserProfile(user=user)
      newly_created_user = True
      created_cnt += 1

    try:
      # Set the field values
      user.set_password(entry['password'])
      for common_field in common_fields:
        if common_field not in ['username', 'password']:
          setattr(userprofile, field_name_map[common_field], entry[common_field])

      # Validate and save
      try:
        user.full_clean()
        userprofile.full_clean()
        user.save()
        userprofile.save()
      except Exception, e:
        # append to errors if validation fails
        errors.append("Error while saving row: " + str(e))
        if newly_created_user:
          user.delete()
        continue

      updated_cnt += 1
    except Exception, e:
      if newly_created_user:
        user.delete()


  updated_cnt -= created_cnt

  return (created_cnt, updated_cnt, errors)
{% endif %}

