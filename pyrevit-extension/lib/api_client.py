# -*- coding: utf-8 -*-
"""API Client for BAPS Backend"""

import json

try:
    # Python 2 (IronPython in Revit)
    import urllib2 as urllib
    from urllib2 import Request, urlopen, HTTPError
    PY2 = True
except ImportError:
    # Python 3
    import urllib.request as urllib
    from urllib.request import Request, urlopen
    from urllib.error import HTTPError
    PY2 = False


class BAPSClient:
    """Client for BAPS Backend API"""
    
    def __init__(self, base_url='http://localhost:3001/api', token=None):
        self.base_url = base_url
        self.token = token
    
    def _make_request(self, endpoint, method='GET', data=None):
        """Make HTTP request to API"""
        url = '{}/{}'.format(self.base_url, endpoint)
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        if self.token:
            headers['Authorization'] = 'Bearer {}'.format(self.token)
        
        if data:
            data = json.dumps(data).encode('utf-8')
        
        req = Request(url, data=data, headers=headers)
        req.get_method = lambda: method
        
        try:
            response = urlopen(req)
            response_data = response.read().decode('utf-8')
            return json.loads(response_data) if response_data else {}
        except HTTPError as e:
            error_msg = e.read().decode('utf-8')
            try:
                error_data = json.loads(error_msg)
                # Handle nested error object structure from backend
                if isinstance(error_data.get('error'), dict):
                    error_message = error_data['error'].get('message', 'Request failed')
                else:
                    error_message = error_data.get('error', error_data.get('message', 'Request failed'))
                raise Exception(error_message)
            except (ValueError, KeyError):
                raise Exception('HTTP Error {}: {}'.format(e.code, error_msg))
    
    def login(self, email, password):
        """Login to backend"""
        data = {
            'email': email,
            'password': password
        }
        return self._make_request('auth/login', method='POST', data=data)
    
    def register(self, email, password, role='GC_USER'):
        """Register new user"""
        data = {
            'email': email,
            'password': password,
            'role': role
        }
        return self._make_request('auth/register', method='POST', data=data)
    
    def get_elements(self):
        """Get all elements"""
        return self._make_request('elements', method='GET')
    
    def create_element(self, element_data):
        """Create new element"""
        return self._make_request('elements', method='POST', data=element_data)
    
    def get_pricing_suggestion(self, element_id):
        """Get AI pricing suggestion for element"""
        endpoint = 'elements/{}/pricing/suggest'.format(element_id)
        return self._make_request(endpoint, method='POST')
