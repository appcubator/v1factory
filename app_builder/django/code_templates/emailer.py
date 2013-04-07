import requests

def send_email(from_email, to_email, subject, text, html):
  email_info = {
    'from_email' : from_email,
    'to_email' : to_email,
    'subject' : subject,
    'text' : text,
    'html' : html,
    'api_key' : '{{ api_key }}'
  }
  requests.post("http://v1factory.com/sendhostedemail", data=email_info)
