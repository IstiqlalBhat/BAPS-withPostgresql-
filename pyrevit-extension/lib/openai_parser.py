# -*- coding: utf-8 -*-
"""OpenAI Intelligent Parser for Schedule Data"""

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


class OpenAIScheduleParser:
    """Parse schedule data using OpenAI GPT with intelligent prompting"""

    def __init__(self, api_key=None, backend_url='http://localhost:3001/api', token=None):
        """
        Initialize parser
        api_key: OpenAI API key (optional, can use backend instead)
        backend_url: Backend API URL to use parsing service
        token: Auth token for backend API
        """
        self.api_key = api_key
        self.backend_url = backend_url
        self.token = token

    def parse_schedule_intelligently(self, schedule_data):
        """
        Parse schedule data using backend's OpenAI service
        schedule_data: dict with 'headers' and 'data' lists
        Returns: list of parsed elements with {name, category, quantity, unit, ...}
        """
        if not schedule_data or not schedule_data.get('data'):
            return []

        # Use backend parsing service
        return self._parse_via_backend(schedule_data)

    def _parse_via_backend(self, schedule_data):
        """Send schedule to backend for intelligent parsing"""
        try:
            url = '{}/schedules/parse'.format(self.backend_url)

            headers = {
                'Content-Type': 'application/json'
            }

            if self.token:
                headers['Authorization'] = 'Bearer {}'.format(self.token)

            # Prepare request
            payload = {
                'schedule_name': schedule_data.get('schedule_name', 'Unknown'),
                'headers': schedule_data.get('headers', []),
                'data': schedule_data.get('data', [])
            }

            data = json.dumps(payload).encode('utf-8')

            req = Request(url, data=data, headers=headers)
            req.get_method = lambda: 'POST'

            # Make request
            response = urlopen(req)
            response_text = response.read().decode('utf-8')
            result = json.loads(response_text)

            # Extract parsed elements from response
            if result.get('success'):
                return result.get('elements', [])
            else:
                raise Exception(result.get('error', 'Parsing failed'))

        except HTTPError as e:
            error_msg = e.read().decode('utf-8')
            try:
                error_json = json.loads(error_msg)
                raise Exception(error_json.get('error', error_msg))
            except:
                raise Exception('HTTP Error {}: {}'.format(e.code, error_msg))
        except Exception as e:
            raise Exception('Failed to parse schedule: {}'.format(str(e)))

    def validate_parsed_elements(self, elements):
        """Validate that parsed elements have required fields"""
        required_fields = ['name', 'category', 'quantity', 'unit']
        valid_elements = []

        for element in elements:
            if all(field in element and element[field] for field in required_fields):
                valid_elements.append(element)

        return valid_elements
