# -*- coding: utf-8 -*-
"""Sync Building Elements to Backend - Extract and upload BIM data"""
__title__ = 'Sync\nElements'
__author__ = 'BAPS Team'

from pyrevit import forms, revit, DB
import os
import json
import sys

# Add lib path for imports
lib_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'lib')
if lib_path not in sys.path:
    sys.path.insert(0, lib_path)

from element_extractor import ElementExtractor
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
    """Main sync function - Extract and upload elements to backend"""
    # Check authentication
    token = get_auth_token()
    if not token:
        forms.alert('Please login first using the Login button', exitscript=True)
    
    # Get active Revit document
    doc = revit.doc
    if not doc:
        forms.alert('No active Revit document found', exitscript=True)
    
    # Initialize element extractor
    extractor = ElementExtractor(doc)
    
    # Ask user what element types to sync
    options = ['Walls', 'Doors', 'Windows', 'Structural Framing', 'All Elements']
    selected = forms.SelectFromList.show(
        options,
        title='Select Elements to Sync',
        multiselect=True,
        button_name='Sync'
    )
    
    if not selected:
        forms.alert('No elements selected', exitscript=True)
    
    # Extract selected elements
    all_elements = []
    
    with forms.ProgressBar(title='Extracting Elements from Revit...') as pb:
        if 'All Elements' in selected or 'Walls' in selected:
            pb.update_progress(0, 100)
            walls = extractor.extract_walls()
            all_elements.extend(walls)
            
        if 'All Elements' in selected or 'Doors' in selected:
            pb.update_progress(25, 100)
            doors = extractor.extract_doors()
            all_elements.extend(doors)
            
        if 'All Elements' in selected or 'Windows' in selected:
            pb.update_progress(50, 100)
            windows = extractor.extract_windows()
            all_elements.extend(windows)
            
        if 'All Elements' in selected or 'Structural Framing' in selected:
            pb.update_progress(75, 100)
            framing = extractor.extract_structural()
            all_elements.extend(framing)
    
    if not all_elements:
        forms.alert('No elements found in the model', exitscript=True)
    
    # Send elements to backend API
    client = BAPSClient(token=token)
    
    with forms.ProgressBar(title='Syncing {} Elements to Backend...'.format(len(all_elements))) as pb:
        try:
            for idx, element in enumerate(all_elements):
                pb.update_progress(idx, len(all_elements))
                client.create_element(element)
            
            forms.alert(
                'Successfully synced {} elements to BAPS!'.format(len(all_elements)),
                title='Sync Complete'
            )
        except Exception as e:
            forms.alert(
                'Error syncing elements: {}'.format(str(e)),
                title='Sync Error',
                warn_icon=True
            )


if __name__ == '__main__':
    main()
