# -*- coding: utf-8 -*-
"""Get AI Pricing Suggestions - Request OpenAI-powered cost estimates"""
__title__ = 'Get\nPricing'
__author__ = 'BAPS Team'

from pyrevit import forms
import os
import json
import sys

# Add lib path for imports
lib_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'lib')
if lib_path not in sys.path:
    sys.path.insert(0, lib_path)

from api_client import BAPSClient


def get_auth_token():
    """Get stored authentication token from config file"""
    config_file = os.path.join(os.getenv('APPDATA'), 'BAPS', 'config.json')
    if os.path.exists(config_file):
        with open(config_file, 'r') as f:
            config = json.load(f)
            return config.get('token')
    return None


def main():
    """Main pricing function - Request and display AI pricing suggestions"""
    # Check authentication
    token = get_auth_token()
    if not token:
        forms.alert('Please login first using the Login button', exitscript=True)
    
    # Initialize API client
    client = BAPSClient(token=token)
    
    try:
        # Get synced elements from backend
        elements = client.get_elements()
        
        if not elements:
            forms.alert(
                'No elements found. Please sync elements first using the Sync Elements button.',
                exitscript=True
            )
        
        # Show element selector dialog
        element_options = [
            '{} - {}'.format(e.get('name', 'Unnamed'), e.get('category', 'Unknown'))
            for e in elements
        ]
        
        selected_idx = forms.SelectFromList.show(
            element_options,
            title='Select Element for AI Pricing',
            button_name='Get Pricing'
        )
        
        if selected_idx is None:
            return
        
        selected_element = elements[selected_idx]
        element_id = selected_element.get('id')
        
        # Request AI pricing from backend
        with forms.ProgressBar(title='Requesting AI Pricing from OpenAI...', indeterminate=True) as pb:
            pricing = client.get_pricing_suggestion(element_id)
        
        if pricing:
            # Display pricing results in formatted dialog
            message = [
                'AI Pricing Suggestion:',
                '',
                'Element: {}'.format(selected_element.get('name')),
                'Category: {}'.format(selected_element.get('category')),
                '',
                'Suggested Price: ${:,.2f}'.format(pricing.get('suggestedPrice', 0)),
                'Confidence: {}%'.format(pricing.get('confidence', 0)),
                '',
                'Reasoning:',
                pricing.get('reasoning', 'No reasoning provided')
            ]
            
            forms.alert('\n'.join(message), title='AI Pricing Suggestion')
        else:
            forms.alert(
                'Could not get pricing suggestion. Please try again.',
                warn_icon=True
            )
            
    except Exception as e:
        forms.alert(
            'Error getting pricing: {}'.format(str(e)),
            title='Pricing Error',
            warn_icon=True
        )


if __name__ == '__main__':
    main()
