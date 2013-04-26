import requests
import simplejson

class DomainAPI(object):
  """Does all domain registration and configuration"""

  def call_api(self, url_ending, data, post=False):
    assert url_ending[0] == '/' # just trying to make sure it's kosher
    url = 'https://dnsimple.com' + url_ending
    if not post: # GET request
      r = requests.get(url,
                           data=data,
                           headers={'Accept': 'application/json', 'Content-Type': 'application/json'},
                           #headers={'Accept': 'application/json'},
                           auth=('founders@v1factory.com', 'domains,mayne'))
    else: # POST request
      r = requests.post(url,
                           data=data,
                           headers={'Accept': 'application/json'},
                           auth=('founders@v1factory.com', 'domains,mayne'))
    return (r.status_code, r.content)

  def check_availability(self, domain):
    """True if available, False if unavailable,
                Exception if invalid and explosion if API call fails. jk."""
    try:
      status_code, response = self.call_api('/domains/%s/check' % domain, {})
    except requests.exceptions.RequestException:
      # I guess this is pretty bad... Maybe it should be logged
      raise Exception("Could not make API call to dnsimple")


    if status_code == 200:
      response = simplejson.loads(response)
      assert response['status'] != 'available'
      return False

    elif status_code == 404: # <= really messed up API. http://developer.dnsimple.com/domains/#check-domain-availability
      response = simplejson.loads(response)
      assert response['status'] == 'available'
      return True

    elif status_code == 400:
      raise Exception("This is not a valid domain")

    else:
      raise Exception("API returned weird status code: %d, content: %s" % (status_code, response))

  def register_domain(self, domain):
    """Registers domain and returns dictionary of the info."""


    if not self.check_availability(domain):
      raise Exception("Domain is not available.")

    if len(domain) < 4:
      raise Exception("Domain too short.")

    valid_domains = ['.com', '.net', '.org']
    if domain[-4:] not in valid_domains:
      raise Exception("Domain not valid.")

    post_data = {"domain":{}}
    post_data["domain"]['name'] = 'springtask.me'
    post_data["domain"]['registrant_id'] = 14454

    try:
      status_code, response = self.call_api('/domain_registrations', post_data, post=True)
    except requests.exceptions.RequestException:
      # I guess this is pretty bad... Maybe it should be logged
      raise Exception("Could not make API call to dnsimple")


    if status_code == 201:
      response = simplejson.loads(response)
      return response

    else:
      raise Exception("Error: status code: %d, content: %s" % (status_code, response))
