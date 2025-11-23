# -*- coding: utf-8 -*-
"""API Client for BAPS Backend"""

import json
import gzip
import zlib

try:
    # Python 2 (IronPython in Revit)
    import urllib2 as urllib
    from urllib2 import Request, urlopen, HTTPError
    from StringIO import StringIO
    PY2 = True
except ImportError:
    # Python 3
    import urllib.request as urllib
    from urllib.request import Request, urlopen
    from urllib.error import HTTPError
    from io import BytesIO as StringIO
    PY2 = False


class BAPSClient:
    """Client for BAPS Backend API"""
    
    def __init__(self, base_url='http://localhost:3001/api', token=None):
        self.base_url = base_url
        self.token = token
    
    def _decompress_if_needed(self, data):
        """Decompress data if it's gzip or deflate compressed"""
        try:
            # Check for gzip magic number (0x1f 0x8b)
            if data[:2] == b'\x1f\x8b':
                return gzip.GzipFile(fileobj=StringIO(data)).read()
        except:
            pass

        try:
            # Try deflate decompression
            return zlib.decompress(data)
        except:
            pass

        # Return as-is if not compressed
        return data

    def _decode_response(self, data):
        """Decode response data with encoding fallback"""
        # First try to decompress if needed
        data = self._decompress_if_needed(data)

        # Try different encodings
        for encoding in ['utf-8', 'utf-8-sig', 'latin-1', 'iso-8859-1', 'cp1252']:
            try:
                return data.decode(encoding)
            except (UnicodeDecodeError, AttributeError):
                continue

        # If all else fails, return with errors ignored
        return data.decode('utf-8', errors='ignore')

    def _make_request(self, endpoint, method='GET', data=None):
        """Make HTTP request to API"""
        url = '{}/{}'.format(self.base_url, endpoint)

        headers = {
            'Content-Type': 'application/json',
            'Accept-Encoding': 'identity'  # Disable automatic compression to avoid encoding issues
        }

        if self.token:
            headers['Authorization'] = 'Bearer {}'.format(self.token)

        if data:
            data = json.dumps(data).encode('utf-8')

        req = Request(url, data=data, headers=headers)
        req.get_method = lambda: method

        try:
            response = urlopen(req)
            response_data = self._decode_response(response.read())
            return json.loads(response_data) if response_data else {}
        except HTTPError as e:
            error_data = self._decode_response(e.read())
            try:
                error_json = json.loads(error_data)
                # Handle nested error object structure from backend
                if isinstance(error_json.get('error'), dict):
                    error_message = error_json['error'].get('message', 'Request failed')
                else:
                    error_message = error_json.get('error', error_json.get('message', 'Request failed'))
                raise Exception(error_message)
            except (ValueError, KeyError):
                raise Exception('HTTP Error {}: {}'.format(e.code, error_data))
    
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

    def create_elements_batch(self, elements):
        """Create multiple elements in a single batch request"""
        data = {'elements': elements}
        return self._make_request('elements/batch', method='POST', data=data)

    def get_pricing_suggestion(self, element_id):
        """Get AI pricing suggestion for element"""
        endpoint = 'elements/{}/pricing/suggest'.format(element_id)
        return self._make_request(endpoint, method='POST')
