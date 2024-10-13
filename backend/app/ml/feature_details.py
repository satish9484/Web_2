import re
import socket
import requests
import whois
from bs4 import BeautifulSoup
from urllib.parse import urlparse

class URLDetailExtraction:
    def __init__(self, url):
        self.url = url
        self.domain = ""
        self.response = None
        self.soup = None
        self.urlparse = None
        self.whois_response = None
        self.details = {}

        self.initialize()

    def initialize(self):
        try:
            self.response = requests.get(self.url)
            self.soup = BeautifulSoup(self.response.text, 'html.parser')
            self.urlparse = urlparse(self.url)
            self.domain = self.urlparse.netloc
            self.whois_response = whois.whois(self.domain)
        except Exception as e:
            print(f"Error initializing details: {e}")

    def get_ip_address(self):
        try:
            ip = socket.gethostbyname(self.domain)
            self.details['IP Address'] = ip
            return ip
        except Exception as e:
            self.details['IP Address'] = 'Unavailable'
            return None

    def get_ssl_info(self):
        # This requires further implementation with an SSL certificate validation library
        self.details['SSL Certificate'] = "Information on SSL Certificate (Implement SSL checking)"
        return self.details['SSL Certificate']

    def get_registrar_info(self):
        try:
            if self.whois_response:
                self.details['Registrar'] = self.whois_response.registrar
                self.details['Domain Creation Date'] = str(self.whois_response.creation_date)
                self.details['Expiration Date'] = str(self.whois_response.expiration_date)
        except Exception as e:
            self.details['Registrar'] = 'Unavailable'

    def get_server_location(self):
        try:
            ip = self.get_ip_address()
            if ip:
                # Implementation of server geolocation can be done via an IP geolocation API
                self.details['Server Location'] = "Server location information (Implement with GeoIP service)"
        except Exception as e:
            self.details['Server Location'] = 'Unavailable'

    def get_content_type(self):
        try:
            if self.response:
                self.details['Content Type'] = self.response.headers.get('Content-Type', 'Unknown')
        except Exception as e:
            self.details['Content Type'] = 'Unavailable'

    def get_social_media_links(self):
        try:
            links = self.soup.find_all('a', href=True)
            social_links = [link['href'] for link in links if any(platform in link['href'] for platform in ['facebook', 'twitter', 'linkedin', 'instagram'])]
            self.details['Social Media Links'] = social_links
        except Exception as e:
            self.details['Social Media Links'] = []

    def get_external_links(self):
        try:
            links = self.soup.find_all('a', href=True)
            external_links = [link['href'] for link in links if self.domain not in link['href']]
            self.details['External Links'] = external_links
        except Exception as e:
            self.details['External Links'] = []

    def get_meta_tags(self):
        try:
            meta_tags = {meta.attrs['name']: meta.attrs['content'] for meta in self.soup.find_all('meta') if 'name' in meta.attrs}
            self.details['Meta Tags'] = meta_tags
        except Exception as e:
            self.details['Meta Tags'] = {}

    def LenUrl(self):
        self.details['Length of Url'] = len(self.url)

    def shortUrl(self):
        match = re.search('bit\.ly|goo\.gl|shorte\.st|go2l\.ink|x\.co|ow\.ly|t\.co|tinyurl|tr\.im|is\.gd|cli\.gs|'
                    'yfrog\.com|migre\.me|ff\.im|tiny\.cc|url4\.eu|twit\.ac|su\.pr|twurl\.nl|snipurl\.com|'
                    'short\.to|BudURL\.com|ping\.fm|post\.ly|Just\.as|bkite\.com|snipr\.com|fic\.kr|loopt\.us|'
                    'doiop\.com|short\.ie|kl\.am|wp\.me|rubyurl\.com|om\.ly|to\.ly|bit\.do|t\.co|lnkd\.in|'
                    'db\.tt|qr\.ae|adf\.ly|goo\.gl|bitly\.com|cur\.lv|tinyurl\.com|ow\.ly|bit\.ly|ity\.im|'
                    'q\.gs|is\.gd|po\.st|bc\.vc|twitthis\.com|u\.to|j\.mp|buzurl\.com|cutt\.us|u\.bb|yourls\.org|'
                    'x\.co|prettylinkpro\.com|scrnch\.me|filoops\.info|vzturl\.com|qr\.net|1url\.com|tweez\.me|v\.gd|tr\.im|link\.zip\.net', self.url)
        if match:
            self.details['Is short url'] = 'Yes'
        else:
            self.details['Is short url'] = 'No'

    def symbols(self):
        # Define the symbols to check for
        symbols = ['@', '?', '-', '=', '.', '#', '%', '+', '$']
        
        # Check if any symbol is present in the URL
        if any(sym in self.url for sym in symbols):
            self.details['Symbols in url'] = 'Yes'
        else:
            self.details['Symbols in url'] = 'No'

    def get_detailed_info(self):
        try:
            self.get_ip_address()
            self.get_ssl_info()
            self.get_registrar_info()
            self.get_server_location()
            self.get_content_type()
            self.get_social_media_links()
            self.get_external_links()
            self.get_meta_tags()
            self.LenUrl()
            self.shortUrl()
            self.symbols()
            return self.details
        except Exception as e:
            return False